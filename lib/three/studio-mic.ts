import * as THREE from 'three';
import { createStage, damp, clamp01, radialTexture } from './stage';
import { foamWall, bokeh } from './backdrop';

export type StudioMic = {
  /** 0 → 1 progress of the section through the viewport. */
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  /** Fires when the mic goes live (ON AIR) or off again. */
  onLive: (cb: (live: boolean) => void) => void;
  /** Light theme: a daylight studio (pale foam, oak desk); dark theme: the night session. */
  setTheme: (light: boolean) => void;
  ready: Promise<void>;
  dispose: () => void;
};

/** Walnut desk top, drawn once. */
function woodTexture(base = '#3a2716') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 160; i++) {
    const y = Math.random() * 512, a = 0.04 + Math.random() * 0.08, w = 1 + Math.random() * 3;
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? '18,10,4' : '92,62,34'},${a})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + Math.sin(x * 0.02 + i * 2) * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

/** The studio's illuminated ON AIR sign. */
function signTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 340;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0c0c09'; g.beginPath(); g.roundRect(8, 8, 1008, 324, 40); g.fill();
  g.strokeStyle = '#fccc0f'; g.lineWidth = 10; g.beginPath(); g.roundRect(34, 34, 956, 272, 26); g.stroke();
  g.fillStyle = '#ffe27a'; g.font = '800 168px -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '18px';
  g.fillText('ON AIR', 520, 178);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** Perforated metal for the grille: opaque metal with a hex grid of round holes (used as an alpha map). */
function meshTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#000';
  const step = 16, r = 5.4;
  for (let row = 0; row < 128 / step * 2 + 1; row++) {
    const y = row * step * 0.866, off = row % 2 ? step / 2 : 0;
    for (let x = -step; x <= 128 + step; x += step) { g.beginPath(); g.arc(x + off, y, r, 0, Math.PI * 2); g.fill(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

/** Engraved brand badge for the body. */
function badgeTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 512, 160);
  g.fillStyle = '#efebdf';
  g.font = '600 64px -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '14px';
  g.fillText('RAKVIH', 263, 70);
  g.fillStyle = '#fccc0f'; g.fillRect(226, 116, 60, 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const tube = (pts: THREE.Vector3[], r: number, seg = 64, rs = 12, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), seg, r, rs, closed);

/**
 * A studio condenser microphone on a sprung boom arm, modelled in code (no download):
 * satin-black body, perforated grille with the gold capsule visible inside, a brand-yellow
 * collar, an elastic shock mount and an engraved RAKVIH badge.
 */
export function mountStudioMic(canvas: HTMLCanvasElement): StudioMic {
  const stage = createStage(canvas, { fov: 26, exposure: 1.1 });
  const { scene, camera } = stage;
  scene.environmentIntensity = 0.75;

  const key = new THREE.DirectionalLight(0xfff0d8, 3); key.position.set(-2.5, 3, 3.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfcaff, 0.5); fill.position.set(3, 0, 2.5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfccc0f, 4); rim.position.set(2.2, 1.8, -2.5); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xc3cc8f, 1.6); rim2.position.set(-2.6, 0.5, -2); scene.add(rim2);

  // set: an acoustic-foam wall grazed by a warm spot, a cooler sage wash from the left, and bokeh
  const wall = foamWall(110, 64, 0.1); wall.position.set(0, 0.6, -1.15);
  const spot = new THREE.SpotLight(0xffcf6a, 12, 7, 0.42, 0.9, 2); spot.position.set(1.5, 1.7, 0.4); spot.target.position.set(0.5, 0.2, -1.15); scene.add(spot, spot.target);
  const wash = new THREE.SpotLight(0xc3cc8f, 3, 7, 0.6, 1, 2); wash.position.set(-1.8, -0.6, 0.3); wash.target.position.set(-0.6, -0.2, -1.15); scene.add(wash, wash.target);
  const bk = bokeh(40, { x: 4, y: 3, z: 1.2, z0: -0.2 }, 0.1); scene.add(bk.points);

  // materials
  const satin = new THREE.MeshPhysicalMaterial({ color: 0x121210, metalness: 0.6, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.22 });
  const matte = new THREE.MeshStandardMaterial({ color: 0x151513, metalness: 0.3, roughness: 0.6 });
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xf2c418, metalness: 1, roughness: 0.22, clearcoat: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 1, roughness: 0.18, emissive: 0xfccc0f, emissiveIntensity: 0 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x9b9a92, metalness: 1, roughness: 0.18 });
  const holes = meshTexture(); holes.repeat.set(44, 24);
  const grille = new THREE.MeshStandardMaterial({ color: 0x4a4943, metalness: 1, roughness: 0.38, alphaMap: holes, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const inner = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, side: THREE.BackSide });
  const elastic = new THREE.MeshStandardMaterial({ color: 0xf0c20e, roughness: 0.55, metalness: 0 });
  const cable = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0b, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 });

  const root = new THREE.Group(); scene.add(root); root.add(wall);
  const mic = new THREE.Group(); root.add(mic);

  // body
  mic.add(new THREE.Mesh(lathe([[0, -0.66], [0.07, -0.66], [0.115, -0.645], [0.13, -0.61], [0.135, -0.5], [0.148, -0.1], [0.152, 0.02], [0.152, 0.05], [0, 0.05]]), satin));
  // fine groove lines on the body
  for (const y of [-0.56, -0.53]) { const g = new THREE.Mesh(new THREE.TorusGeometry(0.139, 0.0025, 8, 96), chrome); g.rotation.x = Math.PI / 2; g.position.y = y; mic.add(g); }
  // brand collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.04, 96), brass); collar.position.y = 0.07; mic.add(collar);
  // grille head (outer mesh + dark core + gold capsule)
  const headPts: [number, number][] = [[0.156, 0.09], [0.162, 0.2], [0.164, 0.42]];
  for (let k = 1; k <= 14; k++) { const a = (k / 14) * Math.PI / 2; headPts.push([0.164 * Math.cos(a), 0.42 + 0.17 * Math.sin(a)]); }
  const head = new THREE.Mesh(lathe(headPts, 128), grille); mic.add(head);
  const core = new THREE.Mesh(lathe(headPts.map(([x, y]) => [x * 0.9, y * 0.98] as [number, number]), 64), inner); mic.add(core);
  const cap = new THREE.Group(); cap.position.y = 0.36; mic.add(cap);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 64), gold); disc.rotation.x = Math.PI / 2; cap.add(disc);
  const discRing = new THREE.Mesh(new THREE.TorusGeometry(0.103, 0.008, 12, 64), chrome); cap.add(discRing);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 16), chrome); post.position.y = -0.16; cap.add(post);
  // head frame bands
  for (const y of [0.09, 0.42]) { const b = new THREE.Mesh(new THREE.TorusGeometry(y > 0.1 ? 0.165 : 0.157, 0.006, 10, 128), satin); b.rotation.x = Math.PI / 2; b.position.y = y; mic.add(b); }
  // badge, wrapped on the front of the body
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.1505, 0.1505, 0.075, 48, 1, true, -0.5, 1),
    new THREE.MeshStandardMaterial({ map: badgeTexture(), transparent: true, metalness: 0.4, roughness: 0.4 }));
  badge.position.y = -0.08; mic.add(badge);
  // status LED
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfccc0f, emissive: 0xfccc0f, emissiveIntensity: 2 }));
  led.position.set(0, 0.0, 0.15); mic.add(led);

  // shock mount: two rings, side posts, yellow elastic cradle
  const mount = new THREE.Group(); root.add(mount);
  const R = 0.27;
  for (const y of [-0.02, -0.44]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.016, 16, 128), matte); ring.rotation.x = Math.PI / 2; ring.position.y = y; mount.add(ring);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4, b = a + Math.PI / 3.2;
      const bodyR = y > -0.1 ? 0.152 : 0.142;
      mount.add(new THREE.Mesh(tube([
        new THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R),
        new THREE.Vector3(Math.cos((a + b) / 2) * (R + bodyR) / 2, y + 0.012, Math.sin((a + b) / 2) * (R + bodyR) / 2),
        new THREE.Vector3(Math.cos(b) * bodyR, y, Math.sin(b) * bodyR),
      ], 0.0065, 20, 8), elastic));
    }
  }
  for (const x of [-R, R]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.42, 16), matte); p.position.set(x, -0.23, 0); mount.add(p); }
  // yoke from the rear of the mount to the boom
  const yoke = new THREE.Mesh(tube([new THREE.Vector3(-R, -0.23, 0), new THREE.Vector3(-R - 0.02, -0.23, -0.2), new THREE.Vector3(0, -0.23, -R - 0.12), new THREE.Vector3(R + 0.02, -0.23, -0.2), new THREE.Vector3(R, -0.23, 0)], 0.016, 64, 12), matte);
  mount.add(yoke);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 24), brass); knob.rotation.z = Math.PI / 2; knob.position.set(R + 0.035, -0.23, 0); mount.add(knob);

  // boom arm: two tubes, a knuckle and twin springs, rising out of frame
  const A = new THREE.Vector3(0, -0.23, -R - 0.12), B = new THREE.Vector3(0.55, 0.62, -0.75), C = new THREE.Vector3(1.05, -0.55, -0.95);
  const arm1 = new THREE.Mesh(tube([A, A.clone().lerp(B, 0.5), B], 0.024, 8, 16), satin); root.add(arm1);
  const arm2 = new THREE.Mesh(tube([B, B.clone().lerp(C, 0.5), C], 0.024, 8, 16), satin); root.add(arm2);
  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), matte); knuckle.position.copy(B); root.add(knuckle);
  const jointA = new THREE.Mesh(new THREE.SphereGeometry(0.036, 24, 16), matte); jointA.position.copy(A); root.add(jointA);
  const spring = (from: THREE.Vector3, to: THREE.Vector3, side: number) => {
    const dir = to.clone().sub(from), len = dir.length(); dir.normalize();
    const n = new THREE.Vector3(0, 0, 1).cross(dir).normalize().multiplyScalar(0.06 * side);
    const pts: THREE.Vector3[] = [], turns = 26, rr = 0.014;
    const u = n.clone().normalize(), v = dir.clone().cross(u).normalize();
    for (let k = 0; k <= turns * 10; k++) {
      const t = k / (turns * 10), a = t * turns * Math.PI * 2;
      pts.push(from.clone().addScaledVector(dir, len * (0.2 + 0.6 * t)).add(n).addScaledVector(u, Math.cos(a) * rr).addScaledVector(v, Math.sin(a) * rr));
    }
    return new THREE.Mesh(tube(pts, 0.0028, turns * 12, 6), chrome);
  };
  root.add(spring(A, B, 1), spring(A, B, -1), spring(B, C, 1));

  // the arm's post and desk clamp
  const DESK = -1.07;                                     // desk top, in root space
  const postM = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, C.y - DESK, 20), satin); postM.position.set(C.x, (C.y + DESK) / 2, C.z); root.add(postM);
  const clampM = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.14), matte); clampM.position.set(C.x, DESK - 0.02, C.z); root.add(clampM);
  const clampKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 20), brass); clampKnob.position.set(C.x, DESK - 0.13, C.z); root.add(clampKnob);
  const jointC = new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 14), matte); jointC.position.copy(C); root.add(jointC);

  // XLR cable: out of the base, down to the desk and away along it
  root.add(new THREE.Mesh(tube([
    new THREE.Vector3(0, -0.66, 0), new THREE.Vector3(0, -0.84, 0.02), new THREE.Vector3(0.04, -1.0, -0.08),
    new THREE.Vector3(0.16, DESK + 0.017, -0.35), new THREE.Vector3(0.6, DESK + 0.017, -0.7), new THREE.Vector3(1.0, DESK + 0.017, -0.86),
  ], 0.017, 96, 12), cable));
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.12, 32), chrome); plug.position.y = -0.71; mic.add(plug);

  // walnut desk
  const wood = woodTexture(); wood.repeat.set(3.6, 1);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(9, 0.07, 2.1), new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.45, envMapIntensity: 0.5 }));
  desk.position.set(0, DESK - 0.035, -0.05); root.add(desk);

  // headphones resting on the desk
  const leather = new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.78 });
  const phones = new THREE.Group(); phones.position.set(-0.9, DESK + 0.07, 0.35); phones.rotation.set(0, 0.7, 0); root.add(phones);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 14, 64, Math.PI), satin); band.rotation.x = -1.35; phones.add(band);
  const padBand = new THREE.Mesh(new THREE.TorusGeometry(0.188, 0.016, 12, 40, Math.PI * 0.5), leather); padBand.rotation.set(-1.35, 0, Math.PI * 0.25); phones.add(padBand);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Group(); cup.position.set(sx * 0.2, -0.02, 0); phones.add(cup);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.06, 40), satin); shell.rotation.z = Math.PI / 2; cup.add(shell);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.007, 10, 48), brass); ringB.rotation.y = Math.PI / 2; ringB.position.x = sx * 0.031; cup.add(ringB);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.024, 14, 40), leather); cushion.rotation.y = Math.PI / 2; cushion.position.x = -sx * 0.04; cup.add(cushion);
  }

  // illuminated ON AIR sign on the foam wall
  const signMat = new THREE.MeshBasicMaterial({ map: signTexture(), toneMapped: false, color: 0x2a2a22 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.32), signMat); sign.position.set(-0.5, 0.86, -1.05); root.add(sign);
  const signBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.05), matte); signBox.position.set(-0.5, 0.86, -1.08); root.add(signBox);
  const signGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(252,204,15,.45)', 'rgba(252,204,15,0)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  signGlow.position.set(-0.5, 0.86, -1.02); root.add(signGlow);

  // pool of light on the desk under the mic
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(252,204,15,.3)', 'rgba(252,204,15,0)'), transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = DESK + 0.004; root.add(glow);

  root.position.y = 0.12;

  // sound: a ring of level bars around the capsule (a live audio visualiser), radiating rings and a glow
  const VIZ = 72;
  const viz = new THREE.Group(); viz.position.y = 0.36; root.add(viz);
  const bars = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.0065, 1), new THREE.MeshBasicMaterial({ color: 0xfccc0f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), VIZ);
  viz.add(bars);
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xfccc0f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const waves = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.206, 96), waveMat.clone()); viz.add(m); return m; });
  const headGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(252,204,15,.55)', 'rgba(252,204,15,0)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  viz.add(headGlow);

  let p = 0, pt = 0, px = 0, py = 0, tx = 0, ty = 0, live = false, liveAmt = 0, fit = 1, narrow = false, isLight = false;
  let lightWood: THREE.CanvasTexture | undefined;
  let liveCb: ((v: boolean) => void) | null = null;
  const smooth = (v: number) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  stage.onResize((w, h) => {
    const a = w / h; narrow = a < 1.05;
    fit = narrow ? 1.2 / a : Math.max(1, 1.55 / a);
    if (narrow) camera.setViewOffset(w, h, 0, -h * 0.12, w, h);
    else camera.setViewOffset(w, h, -w * (a > 1.5 ? 0.17 : 0.11), 0, w, h);
  });

  // camera keyframes: [progress, yaw, pitch, distance, look-at height]
  const KEYS: [number, number, number, number, number][] = [
    [0.00, 0.5, 0.16, 7.8, -0.05],
    [0.18, 0.32, 0.12, 6.4, 0.0],
    [0.34, 0.16, 0.06, 2.9, 0.36],
    [0.60, -0.6, 0.05, 2.5, 0.4],
    [0.82, -0.28, 0.24, 6.6, -0.05],
    [1.00, -0.2, 0.26, 6.9, -0.05],
  ];
  const cam = { yaw: 0, pitch: 0, dist: 0, ty: 0 };
  const sample = (q: number) => {
    let i = 0; while (i < KEYS.length - 2 && q > KEYS[i + 1][0]) i++;
    const [p0, ...a] = KEYS[i], [p1, ...b] = KEYS[i + 1], f = smooth((q - p0) / (p1 - p0));
    cam.yaw = a[0] + (b[0] - a[0]) * f; cam.pitch = a[1] + (b[1] - a[1]) * f; cam.dist = a[2] + (b[2] - a[2]) * f; cam.ty = a[3] + (b[3] - a[3]) * f;
  };
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), zAxis = new THREE.Vector3(0, 0, 1);

  /*
   * Scroll story (p through the pinned section):
   *  .00–.18  wide establishing shot of the studio; the camera drifts in
   *  .20      ON AIR: the sign flickers on, the capsule glows, the mic starts "hearing" a voice
   *  .20–.60  the camera moves in and orbits the mic head while a ring of level bars dances around it
   *  .60–.82  it pulls up and back to a hero shot of the whole set
   */
  stage.onFrame((t, dt) => {
    p = damp(p, pt, 5, dt);
    px = damp(px, tx, 3, dt); py = damp(py, ty, 3, dt);
    const on = p > (live ? 0.18 : 0.2);
    if (on !== live) { live = on; liveCb?.(on); }
    liveAmt = damp(liveAmt, live ? 1 : 0, 3.5, dt);
    const voice = liveAmt * (0.55 + 0.25 * Math.sin(t * 7.3) + 0.2 * Math.sin(t * 13.1 + 1.3)) * (0.7 + 0.3 * Math.sin(t * 1.7));

    sample(p);
    const yaw = cam.yaw + px * 0.12, pitch = cam.pitch - py * 0.05, d = cam.dist * (cam.dist > 3 ? fit : Math.max(1, fit * 0.8));
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, cam.ty + 0.12 + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
    camera.lookAt(0, cam.ty + 0.12, 0);

    mic.position.y = Math.sin(t * 1.3) * 0.006 + voice * 0.004 * Math.sin(t * 40);
    mic.rotation.z = Math.sin(t * 0.9) * 0.01;
    root.rotation.y = -0.25;

    // ON AIR sign: a short flicker, then a steady glow
    const flick = live && liveAmt < 0.6 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : 1;
    const lit = liveAmt * flick;
    signMat.color.setScalar(0.17 + 0.83 * lit);
    (signGlow.material as THREE.MeshBasicMaterial).opacity = lit * 0.9;
    gold.emissiveIntensity = liveAmt * (0.25 + voice * 0.6);
    (led.material as THREE.MeshStandardMaterial).emissiveIntensity = live ? 1.6 + Math.sin(t * 3) * 0.8 : 0.15;
    rim.intensity = 4 + liveAmt * 2.5;
    spot.intensity = 6 + liveAmt * 6 + voice * 3;
    bk.update(t); bk.material.opacity = 0.18 + liveAmt * 0.2;

    // the visualiser faces the camera
    root.updateMatrixWorld();
    q4.copy(root.quaternion).invert().multiply(camera.quaternion);
    viz.quaternion.copy(q4);
    const vizOn = liveAmt * smooth((p - 0.24) / 0.08) * (1 - smooth((p - 0.7) / 0.1) * 0.6);
    (bars.material as THREE.MeshBasicMaterial).opacity = vizOn * 0.7;
    for (let i = 0; i < VIZ; i++) {
      const a = i / VIZ * Math.PI * 2;
      const lvl = 0.015 + vizOn * (0.02 + voice * 0.08 * (0.5 + 0.5 * Math.sin(a * 5 + t * 6) * Math.sin(a * 3 - t * 4.3)));
      const r = 0.34 + lvl / 2;
      q4.setFromAxisAngle(zAxis, a - Math.PI / 2);
      m4.compose(v3.set(Math.cos(a) * r, Math.sin(a) * r, 0), q4, s3.set(1, lvl, 1));
      bars.setMatrixAt(i, m4);
    }
    bars.instanceMatrix.needsUpdate = true;
    (headGlow.material as THREE.MeshBasicMaterial).opacity = liveAmt * (0.35 + voice * 0.4);
    waves.forEach((w, i) => {
      const ph = (t / 1.25 + i / waves.length) % 1;
      w.scale.setScalar(1.6 + ph * 3);
      (w.material as THREE.MeshBasicMaterial).opacity = vizOn * (1 - ph) * (1 - ph) * (0.3 + voice * 0.4);
    });
  });

  return {
    setProgress: v => { pt = clamp01(v); },
    setPointer: (x, y) => { tx = x; ty = y; },
    onLive: cb => { liveCb = cb; cb(live); },
    setTheme: light => {
      if (light === isLight) return; isLight = light;
      const foam = (wall.children[1] as THREE.InstancedMesh).material as THREE.MeshStandardMaterial;
      const backing = (wall.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      foam.color.set(light ? 0xd8d1bf : 0x101108); foam.envMapIntensity = light ? 0.9 : 0.25;
      backing.color.set(light ? 0xb8b09b : 0x0c0d09);
      const dm = desk.material as THREE.MeshPhysicalMaterial;
      dm.map = light ? (lightWood ??= (() => { const t = woodTexture('#a8794a'); t.repeat.set(3.6, 1); return t; })()) : wood; dm.needsUpdate = true;
      scene.environmentIntensity = light ? 1.05 : 0.75;
      key.intensity = light ? 3.4 : 3;
      fill.intensity = light ? 1.1 : 0.5;
      const mode = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      [bars.material as THREE.MeshBasicMaterial, ...waves.map(w => w.material as THREE.MeshBasicMaterial)].forEach(m => { m.blending = mode; m.color.set(light ? 0xb8900a : 0xfccc0f); m.needsUpdate = true; });
      bk.points.visible = !light;
    },
    ready: stage.warm(),
    dispose: stage.dispose,
  };
}
