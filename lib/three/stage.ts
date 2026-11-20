import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** True when the browser can create a WebGL context (checked once, cheaply). */
let webgl: boolean | undefined;
export function canWebGL() {
  if (webgl !== undefined) return webgl;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    webgl = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();   // free the probe context straight away
  } catch { webgl = false; }
  return webgl;
}

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  size: { w: number; h: number };
  onFrame: (cb: (t: number, dt: number) => void) => void;
  onResize: (cb: (w: number, h: number) => void) => void;
  /** Compile shaders and upload textures ahead of time, without blocking the page. */
  warm: () => Promise<void>;
  dispose: () => void;
};

/**
 * A small, self-managing WebGL stage:
 * transparent canvas (the page's CSS background shows through), studio reflections from a
 * pre-filtered room environment, a render loop that only runs while the canvas is on screen
 * and the tab is visible, and a capped pixel ratio so phones stay cool.
 */
export function createStage(canvas: HTMLCanvasElement, opts: { fov?: number; exposure?: number } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // full-screen canvases are expensive: cap the resolution, then let the adaptive loop below tune it
  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let dpr = maxDpr;
  renderer.setPixelRatio(dpr);
  (renderer as THREE.WebGLRenderer & { transmissionResolutionScale?: number }).transmissionResolutionScale = 0.5;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(opts.fov ?? 30, 1, 0.01, 100);
  const size = { w: 1, h: 1 };
  const frames: ((t: number, dt: number) => void)[] = [];
  const resizers: ((w: number, h: number) => void)[] = [];

  const resize = () => {
    const box = canvas.parentElement ?? canvas;
    const w = Math.max(1, box.clientWidth), h = Math.max(1, box.clientHeight);
    if (w === size.w && h === size.h) return;
    size.w = w; size.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    resizers.forEach(f => f(w, h));
    kick();
  };

  let raf = 0, last = 0, onScreen = true, alive = true;
  // adaptive resolution: if frames get slow, render fewer pixels; if there's headroom, step back up
  let acc = 0, n = 0, lastTune = 0;
  const tune = (raw: number, now: number) => {
    if (raw > 0.1) return;                       // ignore tab switches / first frame
    acc += raw; n++;
    if (n < 45 || now - lastTune < 1500) return;
    const avg = acc / n; acc = 0; n = 0;
    let next = dpr;
    if (avg > 0.021 && dpr > 0.8) next = Math.max(0.8, dpr - 0.2);
    else if (avg < 0.0135 && dpr < maxDpr) next = Math.min(maxDpr, dpr + 0.1);
    if (next !== dpr) { dpr = next; lastTune = now; renderer.setPixelRatio(dpr); renderer.setSize(size.w, size.h, false); }
  };
  const loop = (now: number) => {
    raf = 0;
    if (!alive || !onScreen || document.hidden) return;
    const t = now / 1000, raw = last ? t - last : 0, dt = Math.min(0.05, raw || 0.016);
    last = t;
    tune(raw, now);
    frames.forEach(f => f(t, dt));
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  function kick() { if (!raf && alive && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement ?? canvas);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }, { rootMargin: '120px' });
  io.observe(canvas);
  const vis = () => kick();
  document.addEventListener('visibilitychange', vis);
  resize();

  return {
    renderer, scene, camera, size,
    onFrame: cb => { frames.push(cb); kick(); },
    onResize: cb => { resizers.push(cb); cb(size.w, size.h); },
    warm: async () => {
      scene.traverse(o => {
        const m = (o as THREE.Mesh).material; if (!m) return;
        (Array.isArray(m) ? m : [m]).forEach(mt => Object.values(mt).forEach(v => { if (v instanceof THREE.Texture && v.image) renderer.initTexture(v); }));
      });
      try { await renderer.compileAsync(scene, camera); } catch { /* compile on first render instead */ }
    },
    dispose: () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      scene.traverse(o => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        mats.forEach(mt => { Object.values(mt).forEach(v => { if (v instanceof THREE.Texture) v.dispose(); }); mt.dispose(); });
      });
      env.dispose();
      renderer.dispose();
    },
  };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Frame-rate independent damping towards a target. */
export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/** A soft round contact shadow / glow texture drawn once on a canvas. */
export function radialTexture(inner: string, outer: string) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
