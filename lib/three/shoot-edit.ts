import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createStage, damp, clamp01, radialTexture } from './stage';
import { bokeh, floor } from './backdrop';

export type ShootEdit = {
  /** 0 → 1 progress through the pinned section. */
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  ready: Promise<void>;
  dispose: () => void;
};

const smooth = (v: number) => { v = clamp01(v); return v * v * (3 - 2 * v); };
const ease3 = (v: number) => { v = clamp01(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const IMAGES = [
  '/images/course-cinematography.webp', '/images/academy-filmmaking.webp', '/images/academy-photography.webp',
  '/images/course-lighting-sound.webp', '/images/banners/editing-colour.webp', '/images/course-motion-graphics.webp',
  '/images/course-content-creation.webp', '/images/academy-studio.webp',
];
const IMG_ASPECT = 1.5;

// ── timeline canvas layout (px on a 2048 × 840 canvas) ──
const TW = 2048, TH = 840;
const LANES = { V2: [150, 280], V1: [292, 452], A1: [470, 620], A2: [632, 782] } as const;
const X0 = 176, X1 = 2010;
// eight clips: five on V1 (the story), three B-roll overlays on V2
const CLIPS: { lane: 'V1' | 'V2'; x0: number; x1: number; img: number }[] = [
  { lane: 'V1', x0: X0, x1: 520, img: 0 },
  { lane: 'V1', x0: 528, x1: 900, img: 1 },
  { lane: 'V2', x0: 700, x1: 1010, img: 5 },
  { lane: 'V1', x0: 908, x1: 1260, img: 2 },
  { lane: 'V1', x0: 1268, x1: 1640, img: 4 },
  { lane: 'V2', x0: 1380, x1: 1620, img: 6 },
  { lane: 'V1', x0: 1648, x1: X1, img: 3 },
  { lane: 'V2', x0: 1760, x1: 1990, img: 7 },
];

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** The editing app's timeline window, drawn once. */
function timelineTexture() {
  const c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const g = c.getContext('2d')!;
  rr(g, 2, 2, TW - 4, TH - 4, 34); g.fillStyle = 'rgba(17,19,13,.94)'; g.fill();
  g.strokeStyle = 'rgba(239,235,223,.14)'; g.lineWidth = 3; g.stroke();
  // title bar
  ['#e0614f', '#e8b931', '#7fae4f'].forEach((col, i) => { g.beginPath(); g.arc(46 + i * 34, 44, 10, 0, Math.PI * 2); g.fillStyle = col; g.globalAlpha = .75; g.fill(); g.globalAlpha = 1; });
  g.font = '600 26px -apple-system, "SF Pro Text", Helvetica, Arial, sans-serif'; g.fillStyle = 'rgba(239,235,223,.6)'; g.textBaseline = 'middle';
  g.fillText('RAKVIH_Showreel_v3  —  Timeline', 168, 45);
  g.textAlign = 'right'; g.fillStyle = 'rgba(252,204,15,.85)'; g.fillText('4K · 24 fps', TW - 40, 45); g.textAlign = 'left';
  // ruler
  g.fillStyle = 'rgba(239,235,223,.05)'; g.fillRect(X0, 88, X1 - X0, 46);
  g.strokeStyle = 'rgba(239,235,223,.28)'; g.lineWidth = 2; g.font = '500 19px -apple-system, "SF Pro Text", Helvetica, Arial, sans-serif'; g.fillStyle = 'rgba(239,235,223,.45)';
  for (let k = 0; k <= 60; k++) {
    const x = X0 + (X1 - X0) * k / 60, big = k % 10 === 0;
    g.beginPath(); g.moveTo(x, 134); g.lineTo(x, big ? 104 : 122); g.stroke();
    if (big) g.fillText(`00:00:${String(k / 2).padStart(2, '0')}:00`, x + 6, 102);
  }
  // lanes + labels
  (Object.keys(LANES) as (keyof typeof LANES)[]).forEach(k => {
    const [y0, y1] = LANES[k];
    g.fillStyle = 'rgba(239,235,223,.03)'; g.fillRect(X0, y0, X1 - X0, y1 - y0);
    g.fillStyle = 'rgba(239,235,223,.07)'; rr(g, 26, y0 + 6, 126, y1 - y0 - 12, 14); g.fill();
    g.fillStyle = k.startsWith('V') ? 'rgba(252,204,15,.9)' : 'rgba(195,204,143,.9)';
    g.font = '700 30px -apple-system, "SF Pro Display", Helvetica, Arial, sans-serif'; g.fillText(k, 54, (y0 + y1) / 2);
  });
  // audio waveforms: dialogue on A1, music on A2
  const wave = (y0: number, y1: number, col: string, seed: number, from: number, to: number) => {
    const mid = (y0 + y1) / 2, h = (y1 - y0) / 2 - 14;
    rr(g, from, y0 + 8, to - from, y1 - y0 - 16, 12); g.fillStyle = col.replace('ALPHA', '.12'); g.fill();
    g.fillStyle = col.replace('ALPHA', '.85');
    for (let x = from + 8; x < to - 8; x += 6) {
      const a = Math.abs(Math.sin(x * 0.021 + seed) * 0.6 + Math.sin(x * 0.0067 + seed * 2) * 0.3 + Math.sin(x * 0.13) * 0.1);
      const hh = Math.max(3, a * h); g.fillRect(x, mid - hh, 3, hh * 2);
    }
  };
  wave(LANES.A1[0], LANES.A1[1], 'rgba(195,204,143,ALPHA)', 1, X0, 1250);
  wave(LANES.A1[0], LANES.A1[1], 'rgba(195,204,143,ALPHA)', 4, 1270, X1);
  wave(LANES.A2[0], LANES.A2[1], 'rgba(252,204,15,ALPHA)', 2.5, X0, X1);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** Small live overlay text for the preview monitor (REC / play timecode). */
function overlay() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 72;
  const g = c.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  let last = '';
  return {
    tex,
    set(text: string, rec: boolean) {
      if (text === last) return; last = text;
      g.clearRect(0, 0, 1024, 72);
      g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, 8, 8, 1008, 56, 14); g.fill();
      g.font = '600 32px -apple-system, "SF Pro Text", Helvetica, Arial, sans-serif'; g.textBaseline = 'middle';
      if (rec) { g.fillStyle = '#e5352b'; g.beginPath(); g.arc(44, 36, 11, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = rec ? '#ffffff' : '#fccc0f'; g.fillText(text, rec ? 66 : 30, 37);
      g.textAlign = 'right'; g.fillStyle = 'rgba(239,235,223,.7)'; g.fillText('RAKVIH DIGITAL', 996, 37); g.textAlign = 'left';
      tex.needsUpdate = true;
    },
  };
}

/** Fit an image texture into a w × h rectangle like CSS object-fit: cover. */
function cover(src: THREE.Texture, w: number, h: number) {
  const t = src.clone(); const a = w / h;
  if (a > IMG_ASPECT) { t.repeat.set(1, IMG_ASPECT / a); t.offset.set(0, (1 - t.repeat.y) / 2); }
  else { t.repeat.set(a / IMG_ASPECT, 1); t.offset.set((1 - t.repeat.x) / 2, 0); }
  t.needsUpdate = true;
  return t;
}

/** A dark photo studio as an environment map: softboxes and strip lights give the metal real highlights. */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x060606);
  const box = (w: number, h: number, pos: [number, number, number], color: number, power: number) => {
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    mat.color.multiplyScalar(power);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(5, 3, [-4, 4.5, 4], 0xfff1dc, 7);      // big key softbox, front-left high
  box(0.7, 5, [5, 1, 2.5], 0xe8eeff, 4.5);   // tall strip, right
  box(0.6, 5, [-4.5, 1, -4], 0xffffff, 5);   // rim strip, back-left
  box(0.6, 4, [4, 1.5, -4.5], 0xffd27a, 3);  // warm kicker, back-right (brand gold)
  box(4, 4, [0, 7, 0], 0xffffff, 1.6);       // overhead
  box(9, 1.2, [0, -0.4, 7], 0x2a2a28, 1);    // faint bounce card
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  env.traverse(o => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
  return tex;
}

/** Re-dress the model's materials like a modern cinema camera: anodised black aluminium, satin steel, coated glass. */
function cineMaterial(src: THREE.MeshStandardMaterial): THREE.Material {
  const base = { name: src.name, map: src.map ?? null, normalMap: src.normalMap ?? null, envMapIntensity: 1.2 };
  const P = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial({ ...base, ...o });
  switch (src.name) {
    case 'body': return P({ color: 0x1c1d20, metalness: 0.88, roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.28 });
    case 'panel': return P({ color: 0x2b2d31, metalness: 0.8, roughness: 0.48 });
    case 'alu_black': case 'matte': return P({ color: 0x17181b, metalness: 0.92, roughness: 0.32, clearcoat: 0.2, clearcoatRoughness: 0.3 });
    case 'steel': return P({ color: 0x8e949c, metalness: 1, roughness: 0.28 });
    case 'dark_steel': return P({ color: 0x2e3135, metalness: 1, roughness: 0.3 });
    case 'red': return P({ color: 0xd2231a, metalness: 0.25, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.12 });
    case 'lens_black': return P({ color: 0x121315, metalness: 0.6, roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.3 });
    case 'ring_zoom': case 'ring_focus': case 'ring_iris': return P({ color: 0x8a8a8a, metalness: 0.15, roughness: 0.72 });
    case 'glass_a': case 'glass_b': return P({
      color: 0x04050a, metalness: 0, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.6,
      iridescence: 1, iridescenceIOR: 1.65, iridescenceThicknessRange: [260, 720], specularIntensity: 1, ior: 1.7,
    });
    case 'rubber': case 'bellows': case 'flock': case 'cable': return P({ color: 0x0c0c0d, metalness: 0, roughness: 0.82, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x3a3a3a) });
    case 'plastic': return P({ color: 0x101012, metalness: 0, roughness: 0.42, clearcoat: 0.3 });
    case 'screen': return P({ color: 0x0a0a0a, roughness: 0.05, metalness: 0, clearcoat: 1, emissive: 0xffffff, emissiveMap: src.map ?? null, emissiveIntensity: 0.9, map: null });
    default: { src.envMapIntensity = 1.2; return src; }
  }
}

/**
 * "Shoot & Edit": a 3D cinema camera on a tripod (/3d/camera_with_tripod.glb) starts recording;
 * the frames it captures fly out of the lens and land as clips on an editing timeline; then the
 * playhead plays the cut on a preview monitor.
 */
export function mountShootEdit(canvas: HTMLCanvasElement): ShootEdit {
  const stage = createStage(canvas, { fov: 30, exposure: 1.05 });
  const { scene, camera } = stage;
  // photographic studio lighting: softbox reflections in the metal + a key, a cool fill and two rims
  const studio = studioEnvironment(stage.renderer);
  scene.environment = studio;
  scene.environmentIntensity = 1;

  const key = new THREE.DirectionalLight(0xfff3e2, 3.2); key.position.set(-2.8, 3.6, 3.4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xd4ddff, 0.55); fill.position.set(3.2, 0.6, 2.6); scene.add(fill);
  const top = new THREE.SpotLight(0xffffff, 26, 9, 0.5, 0.65, 1.4); top.position.set(-1.1, 4.2, 1.2); top.target.position.set(-1.2, 0.2, 0); scene.add(top, top.target);
  const rim = new THREE.DirectionalLight(0xffd36b, 2.6); rim.position.set(1.6, 2.2, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xbfd2ff, 1.6); rim2.position.set(-3.2, 0.8, -2.2); scene.add(rim2);

  const world = new THREE.Group(); scene.add(world);
  const bk = bokeh(60, { x: 7, y: 3.5, z: 2.5, z0: -1.2 }, 0.14); scene.add(bk.points);
  const ground = floor(6); ground.position.y = -1.25; world.add(ground);

  // ── cine camera on a tripod (/3d/camera_with_tripod.glb) ──
  const camRig = new THREE.Group(); world.add(camRig);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,.78)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, toneMapped: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.y = -1.195; camRig.add(contact);
  const tripod = new THREE.Group(); camRig.add(tripod);
  const body = new THREE.Group(); camRig.add(body);
  const recLedMats: THREE.MeshStandardMaterial[] = [];

  // lens light beam (visible while recording)
  const beamTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); })();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.42, 1.6, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfccc0f, alphaMap: beamTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  beam.geometry.translate(0, -0.8, 0); beam.geometry.rotateX(-Math.PI / 2);
  body.add(beam);
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,236,170,.95)', 'rgba(252,204,15,0)'), transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  flare.renderOrder = 10; scene.add(flare);
  const lensPt = new THREE.Vector3(0, 0.3, 0.72);   // lens front in body space (filled after load)

  // ── editing timeline + preview monitor ──
  const tl = new THREE.Group(); world.add(tl);
  const PW = 2.3, PH = PW * TH / TW;
  const panelMat = new THREE.MeshBasicMaterial({ map: timelineTexture(), transparent: true, toneMapped: false, depthWrite: false });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), panelMat); tl.add(panel);
  const toWorld = (x: number, y: number) => new THREE.Vector3((x / TW - 0.5) * PW, (0.5 - y / TH) * PH, 0);
  const laneTop = toWorld(0, LANES.V2[0]).y, laneBottom = toWorld(0, LANES.A2[1]).y;
  const playhead = new THREE.Group(); tl.add(playhead);
  const phMat = new THREE.MeshBasicMaterial({ color: 0xfccc0f, toneMapped: false, transparent: true, opacity: 0 });
  const phLine = new THREE.Mesh(new THREE.PlaneGeometry(0.006, laneTop - laneBottom + 0.12), phMat); phLine.position.set(0, (laneTop + laneBottom) / 2 + 0.03, 0.012); playhead.add(phLine);
  const phCap = new THREE.Mesh(new THREE.CircleGeometry(0.024, 3), phMat); phCap.rotation.z = -Math.PI / 2; phCap.position.set(0, laneTop + 0.1, 0.012); playhead.add(phCap);

  const monitor = new THREE.Group(); tl.add(monitor);
  const MW = 1.18, MH = MW * 9 / 16;
  monitor.position.set(0.18, PH / 2 + MH / 2 + 0.16, -0.05);
  const bezelMat = new THREE.MeshPhysicalMaterial({ color: 0x121210, metalness: 0.55, roughness: 0.38, clearcoat: 0.5, transparent: true });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(MW + 0.05, MH + 0.05, 0.035), bezelMat); bezel.position.z = -0.02; monitor.add(bezel);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x050505, toneMapped: false, transparent: true });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), screenMat); monitor.add(screen);
  const ov = overlay();
  const ovMesh = new THREE.Mesh(new THREE.PlaneGeometry(MW * 0.94, MW * 0.94 * 72 / 1024), new THREE.MeshBasicMaterial({ map: ov.tex, transparent: true, toneMapped: false, depthWrite: false }));
  ovMesh.position.set(0, -MH / 2 + 0.05, 0.004); monitor.add(ovMesh);
  const monGlow = new THREE.Mesh(new THREE.PlaneGeometry(MW * 2.2, MH * 2.6), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(252,204,15,.16)', 'rgba(252,204,15,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  monGlow.position.z = -0.08; monitor.add(monGlow);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), bezelMat); stand.position.set(0, -MH / 2 - 0.08, -0.04); monitor.add(stand);

  // clips (fly from the lens into their slots)
  type Clip = { mesh: THREE.Mesh; bar: THREE.Mesh; slot: THREE.Vector3; w: number; h: number; start: number; img: number; x0: number; x1: number; lane: string };
  const clips: Clip[] = [];
  const clipGroup = new THREE.Group(); scene.add(clipGroup);
  const loader = new THREE.TextureLoader();
  const images: THREE.Texture[] = [];
  const monTex: THREE.Texture[] = [];

  let p = 0, pt = 0, px = 0, py = 0, tx = 0, ty = 0, loaded = false, narrow = false, d0 = 5;

  const layout = () => {
    const a = stage.size.w / stage.size.h;
    narrow = a < 1.05;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (!narrow) {
      camRig.position.set(-1.28, -0.05, 0.1); camRig.scale.setScalar(1);
      tl.position.set(0.95, -0.18, 0); tl.rotation.set(0, -0.2, 0); tl.scale.setScalar(1);
      // the set (tripod feet → timeline edge ≈ 4.3 wide, floor → monitor top ≈ 2.5 tall) fits the right ~62% of the
      // screen; the copy sits on the left
      const share = a > 1.5 ? 0.67 : 0.6;
      d0 = Math.max(3.78 / (share * 2 * tan * a), 2.45 / (0.92 * 2 * tan));
      camera.setViewOffset(stage.size.w, stage.size.h, -stage.size.w * (0.5 - share / 2 - 0.02) + stage.size.w * 0.0, -stage.size.h * 0.02, stage.size.w, stage.size.h);
    } else {
      camRig.position.set(-0.55, 0.62, -0.2); camRig.scale.setScalar(0.62);
      tl.position.set(0, -0.62, 0.1); tl.rotation.set(0, 0, 0); tl.scale.setScalar(0.74);
      // phones: the set lives in the lower half, clear of the copy above and the buttons below
      d0 = Math.max(2.15 / (2 * tan * a), 2.05 / (0.46 * 2 * tan));
      camera.setViewOffset(stage.size.w, stage.size.h, 0, -stage.size.h * 0.15, stage.size.w, stage.size.h);
    }
  };
  stage.onResize(() => layout());

  const ready = Promise.all([
    new Promise<THREE.Group>((res, rej) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('/3d/camera_with_tripod.glb', g => res(g.scene), undefined, rej)),
    ...IMAGES.map(src => new Promise<THREE.Texture>((res, rej) => loader.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, rej))),
  ]).then(([model, ...tex]) => {
    const m = model as THREE.Group;
    m.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(m);
    const h = box.max.y - box.min.y, s = 1.98 / Math.max(0.001, h);
    const c = box.getCenter(new THREE.Vector3());
    // rest the tripod feet flush on the floor pool (y = -1.25 in world, camRig.y = -0.05 on desktop)
    const ox = -c.x * s, oy = -1.20 - box.min.y * s, oz = 0;

    const tripodGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    let tripodTopY = -0.12;
    const tripodBox = new THREE.Box3();
    const glassBox = new THREE.Box3();

    const upgraded = new Map<THREE.Material, THREE.Material>();
    m.traverse(o => {
      const mm = o as THREE.Mesh;
      if (!mm.isMesh) return;
      const swap = (mat: THREE.Material) => {
        if (!upgraded.has(mat)) upgraded.set(mat, cineMaterial(mat as THREE.MeshStandardMaterial));
        return upgraded.get(mat)!;
      };
      mm.material = Array.isArray(mm.material) ? mm.material.map(swap) : swap(mm.material);
      const mats = Array.isArray(mm.material) ? mm.material : [mm.material];
      mats.forEach(mat => {
        const std = mat as THREE.MeshStandardMaterial;
        if (std.map) std.map.anisotropy = 8;
        if (o.name.endsWith('__led') || std.name === 'led') {
          std.emissive.set(0xff2a1a);
          std.emissiveIntensity = 0.08;
          if (!recLedMats.includes(std)) recLedMats.push(std);
        }
      });
    });

    // split tripod legs (stationary on floor) from camera head (pivots gently on the fluid head)
    for (const child of [...m.children]) {
      if (child.name.startsWith('tripod__')) {
        tripodBox.expandByObject(child);
        tripodGroup.add(child);
      } else {
        if (child.name.includes('glass')) glassBox.expandByObject(child);
        headGroup.add(child);
      }
    }
    if (!tripodBox.isEmpty()) tripodTopY = tripodBox.max.y;
    const headPivotY = oy + tripodTopY * s;

    tripodGroup.scale.setScalar(s);
    tripodGroup.position.set(ox, oy, oz);
    tripod.add(tripodGroup);

    body.position.set(0, headPivotY, 0);
    headGroup.scale.setScalar(s);
    headGroup.position.set(ox, oy - headPivotY, oz);
    body.add(headGroup);

    // exact front optical glass centre in body space (used for beam, flare, close-up & flying clips)
    if (!glassBox.isEmpty()) {
      const gc = glassBox.getCenter(new THREE.Vector3());
      lensPt.set(ox + gc.x * s, (oy - headPivotY) + gc.y * s, oz + glassBox.max.z * s + 0.01);
    } else {
      lensPt.set(0, (oy - headPivotY), oz + box.max.z * s);
    }
    beam.position.copy(lensPt);
    images.push(...(tex as THREE.Texture[]));
    monTex.push(...images.map(t => cover(t, 16, 9)));
    tl.updateMatrixWorld(true);
    CLIPS.forEach((cl, k) => {
      const [y0, y1] = LANES[cl.lane];
      const a0 = toWorld(cl.x0 + 4, y0 + 8), a1 = toWorld(cl.x1 - 4, y1 - 8);
      const w = a1.x - a0.x, hh = a0.y - a1.y;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cover(images[cl.img], w, hh), toneMapped: false, transparent: true }));
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.07), new THREE.MeshBasicMaterial({ color: cl.lane === 'V1' ? 0xc3cc8f : 0xfccc0f, toneMapped: false, transparent: true }));
      bar.position.set(0, 0.465, 0.001); mesh.add(bar);
      mesh.visible = false; clipGroup.add(mesh);
      clips.push({ mesh, bar, slot: new THREE.Vector3((a0.x + a1.x) / 2, (a0.y + a1.y) / 2, 0.01), w, h: hh, start: 0.34 + k * 0.03, img: cl.img, x0: cl.x0, x1: cl.x1, lane: cl.lane });
    });
    layout();
    loaded = true;
  });

  const fwd = new THREE.Vector3(), farPos = new THREE.Vector3(), farLook = new THREE.Vector3(), nearPos = new THREE.Vector3(), look = new THREE.Vector3();
  const lensW = new THREE.Vector3(), slotW = new THREE.Vector3(), ctrl = new THREE.Vector3(), tmp = new THREE.Vector3();
  const qFrom = new THREE.Quaternion(), qTo = new THREE.Quaternion(), e = new THREE.Euler();
  const bez = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number, out: THREE.Vector3) =>
    out.set(0, 0, 0).addScaledVector(a, (1 - t) * (1 - t)).addScaledVector(b, 2 * (1 - t) * t).addScaledVector(c, t * t);
  const tc = (sec: number) => { const f = Math.floor((sec % 1) * 12) * 2; const s = Math.floor(sec); return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };

  /*
   * Story (p through the pinned section):
   *   .00–.22  the camera turns towards you and starts recording (REC, lens beam)
   *   .18–.30  the editing timeline and monitor rise into place
   *   .30–.58  eight frames fly from the lens and land as clips on the timeline
   *   .62–.95  the playhead plays the cut on the monitor
   */
  stage.onFrame((t, dt) => {
    if (!loaded) return;
    p = damp(p, pt, 6, dt);
    px = damp(px, tx, 3, dt); py = damp(py, ty, 3, dt);
    bk.update(t);

    /*
     * Story (p through the pinned section):
     *   .00–.22  extreme close-up on the lens, already recording — the view slowly pulls back to the whole set
     *   .22–.34  the editing timeline and monitor rise into place
     *   .34–.66  the frames fly from the lens and land as clips
     *   .68–.92  the playhead plays the cut; then everything rests
     */
    const pull = ease3(p / 0.22);
    const rec = p > 0.02 && p < 0.7;
    const recAmt = smooth((p - 0.01) / 0.05) * (1 - smooth((p - 0.66) / 0.06));
    const panelIn = smooth((p - 0.22) / 0.12);
    const play = smooth((p - 0.68) / 0.24);

    camRig.rotation.y = (narrow ? 0.25 : 0.62) * pull + px * 0.08 * pull;
    body.rotation.x = -0.02 + Math.sin(t * 0.6) * 0.004;
    const ledGlow = rec ? (Math.sin(t * 6) > 0 ? 4.5 : 0.7) : 0.08;
    for (const lm of recLedMats) lm.emissiveIntensity = ledGlow;
    (beam.material as THREE.MeshBasicMaterial).opacity = recAmt * pull * (0.06 + Math.sin(t * 2.2) * 0.012);

    tl.position.y = (narrow ? -0.62 : -0.18) - (1 - panelIn) * 0.35;
    panelMat.opacity = panelIn;
    tl.rotation.x = (1 - panelIn) * 0.35 + py * 0.03;
    tl.rotation.y = (narrow ? 0 : -0.2) - px * 0.05;
    screenMat.opacity = panelIn; bezelMat.opacity = panelIn; bezel.visible = stand.visible = panelIn > 0.01;
    monitor.scale.setScalar(0.92 + 0.08 * panelIn);
    (ovMesh.material as THREE.MeshBasicMaterial).opacity = panelIn;
    (monGlow.material as THREE.MeshBasicMaterial).opacity = panelIn * (0.9 + play * 0.7);

    // camera: from just in front of the matte box / lens, back to the framing shot, then a slow push-in
    world.updateMatrixWorld(true);
    lensW.copy(lensPt); body.localToWorld(lensW);
    fwd.copy(lensPt); fwd.z += 1; body.localToWorld(fwd); fwd.sub(lensW).normalize();
    const dist = d0 * (1.04 - 0.06 * smooth((p - 0.22) / 0.7));
    farPos.set(px * 0.18 * pull, 0.2 + py * -0.08 * pull, dist);
    farLook.set(narrow ? 0 : 0.2, narrow ? 0.0 : -0.08, 0);
    nearPos.copy(lensW).addScaledVector(fwd, narrow ? 1.28 : 1.32);
    camera.position.lerpVectors(nearPos, farPos, pull);
    look.lerpVectors(lensW, farLook, ease3(p / 0.2));
    camera.lookAt(look);

    // lens flare: bright while recording, softening as the view pulls away
    flare.position.copy(lensW).addScaledVector(fwd, 0.02);
    flare.quaternion.copy(camera.quaternion);
    flare.scale.setScalar(0.28 + pull * 0.5);
    (flare.material as THREE.MeshBasicMaterial).opacity = recAmt * (0.22 + pull * 0.16 + Math.sin(t * 2.6) * 0.04);

    // fly the frames
    tl.getWorldQuaternion(qTo);
    let landed = 0;
    clips.forEach((c, k) => {
      const f = smooth((p - c.start) / 0.11);
      c.mesh.visible = f > 0.001;
      if (!c.mesh.visible) return;
      if (f >= 1) landed++;
      slotW.copy(c.slot); tl.localToWorld(slotW);
      ctrl.copy(lensW).lerp(slotW, 0.5); ctrl.y += 0.55 + (k % 3) * 0.12; ctrl.z += 0.7;
      bez(lensW, ctrl, slotW, f, tmp);
      c.mesh.position.copy(tmp);
      const sw = THREE.MathUtils.lerp(0.13, c.w * tl.scale.x, f), sh = THREE.MathUtils.lerp(0.075, c.h * tl.scale.x, f);
      c.mesh.scale.set(sw, sh, 1);
      e.set(0, camRig.rotation.y * 0.6, (1 - f) * (k % 2 ? 0.5 : -0.5)); qFrom.setFromEuler(e);
      c.mesh.quaternion.slerpQuaternions(qFrom, qTo, f);
      const mat = c.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, f * 6);
      (c.bar.material as THREE.MeshBasicMaterial).opacity = smooth((f - 0.85) / 0.15);
    });

    // playhead + monitor
    const xPx = X0 + (X1 - X0) * play;
    playhead.position.x = toWorld(xPx, 0).x;
    phMat.opacity = smooth((p - 0.62) / 0.06);
    let show = -1;
    if (play > 0) {
      const under = clips.filter(c => c.lane === 'V2' && xPx >= c.x0 && xPx <= c.x1)[0] ?? clips.filter(c => c.lane === 'V1' && xPx >= c.x0 && xPx <= c.x1)[0];
      show = under ? under.img : clips[clips.length - 1].img;
      ov.set(`▶  ${tc(play * 30)}`, false);
    } else if (rec) {
      show = 0;
      ov.set(`REC  ${tc((p - 0.02) * 40)}`, true);
    } else if (landed) {
      show = clips[0].img; ov.set('▶  00:00:00:00', false);
    } else ov.set('STANDBY', false);
    if (show >= 0 && screenMat.map !== monTex[show]) { screenMat.map = monTex[show]; screenMat.color.set(0xffffff); screenMat.needsUpdate = true; }
    if (show < 0 && screenMat.map) { screenMat.map = null; screenMat.color.set(0x050505); screenMat.needsUpdate = true; }
  });

  return {
    setProgress: v => { pt = clamp01(v); },
    setPointer: (x, y) => { tx = x; ty = y; },
    ready: ready.then(() => stage.warm()),
    dispose: stage.dispose,
  };
}
