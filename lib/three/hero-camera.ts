import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createStage, damp, clamp01, radialTexture } from './stage';
import { dial, bokeh, floor } from './backdrop';

export type PartLabel = { x: number; y: number; o: number; side: 'l' | 'r' };
export type HeroCamera = {
  /** 0 → 1 scroll progress through the pinned hero. */
  setProgress: (p: number) => void;
  /** Pointer position, -1 → 1 on each axis. */
  setPointer: (x: number, y: number) => void;
  /** 'dive' = desktop story (burst → labels → 360° rebuild → dive), 'compact' = phones (burst → labels → rebuild). */
  setMode: (m: 'dive' | 'compact') => void;
  /** Every rendered frame: the lens glass on screen (CSS px) and the eased progress. */
  onLens: (cb: (x: number, y: number, r: number, p: number) => void) => void;
  /** Every rendered frame: where each labelled part is on screen, and how visible its label should be. */
  onLabels: (cb: (labels: PartLabel[]) => void) => void;
  ready: Promise<void>;
  dispose: () => void;
};

import { PART_LABELS } from './part-labels';
export { PART_LABELS };

type Part = { mesh: THREE.Mesh; home: THREE.Vector3; off: THREE.Vector3; axis: THREE.Vector3; spin: number; label: number; size: number };

/** Split a mesh into its disconnected pieces (vertices welded by position so UV seams don't split a piece). */
function splitIslands(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position, n = pos.count;
  const parent = new Int32Array(n); for (let i = 0; i < n; i++) parent[i] = i;
  const find = (i: number) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const uni = (a: number, b: number) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  const seen = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    const j = seen.get(k); if (j === undefined) seen.set(k, i); else uni(i, j);
  }
  const idx = geo.index;
  const tri = (t: number) => (idx ? idx.getX(t) : t);
  const triCount = idx ? idx.count : n;
  for (let t = 0; t < triCount; t += 3) { uni(tri(t), tri(t + 1)); uni(tri(t), tri(t + 2)); }
  const tris = new Map<number, number[]>();
  for (let t = 0; t < triCount; t += 3) { const r = find(tri(t)); let l = tris.get(r); if (!l) tris.set(r, l = []); l.push(tri(t), tri(t + 1), tri(t + 2)); }
  const out: { geo: THREE.BufferGeometry; center: THREE.Vector3; size: number }[] = [];
  tris.forEach(list => {
    const remap = new Map<number, number>(), order: number[] = [];
    const index = list.map(v => { let m = remap.get(v); if (m === undefined) { m = order.length; remap.set(v, m); order.push(v); } return m; });
    const g = new THREE.BufferGeometry();
    for (const name of Object.keys(geo.attributes)) {
      const a = geo.attributes[name], arr = new Float32Array(order.length * a.itemSize);
      order.forEach((v, i) => { for (let c = 0; c < a.itemSize; c++) arr[i * a.itemSize + c] = a.getComponent(v, c); });
      g.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize));
    }
    g.setIndex(index);
    g.computeBoundingBox();
    const center = g.boundingBox!.getCenter(new THREE.Vector3()), size = g.boundingBox!.getSize(new THREE.Vector3()).length();
    g.translate(-center.x, -center.y, -center.z);
    out.push({ geo: g, center, size });
  });
  return out;
}

const smooth = (t: number) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const ease3 = (t: number) => { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

/**
 * The hero's photo-scanned camera (Poly Haven "Camera 01", CC0), split into its real parts.
 * Desktop story (p through a long pinned hero):
 *   .05–.20  burst: the lens telescopes forward element by element, the dials lift, the eyepiece slides back
 *   .20–.40  exploded view turns slowly while seven parts are labelled
 *   .40–.54  everything flies home while the camera makes a full 360° turn, ending face-on
 *   .54–.74  the view dives into the lens, where the page opens into the photographs
 * Phones: the same burst, labels and 360° rebuild, without the dive.
 */
export function mountHeroCamera(canvas: HTMLCanvasElement, opts: { still?: boolean } = {}): HeroCamera {
  const stage = createStage(canvas, { fov: 28, exposure: 1.05 });
  const { scene, camera } = stage;
  scene.environmentIntensity = 0.9;

  const key = new THREE.DirectionalLight(0xfff1dc, 2.6); key.position.set(-2.2, 2.6, 3); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9d3ff, 0.55); fill.position.set(3, 0.6, 2); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfccc0f, 3.2); rim.position.set(1.6, 1.4, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xc3cc8f, 1.4); rim2.position.set(-2.4, -0.4, -2.2); scene.add(rim2);

  const rig = new THREE.Group(); scene.add(rig);       // pointer + idle sway
  const turn = new THREE.Group(); rig.add(turn);       // scroll-driven turn

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.75),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; rig.add(shadow);

  // set: a giant engraved lens face (its focus ring turns as you scroll), bokeh, a soft floor pool
  const back = new THREE.Group(); back.position.set(0, 0.04, -1.5); scene.add(back);
  const focusDial = dial('focus', 2.15), apDial = dial('aperture', 2.15);
  apDial.position.z = 0.01; back.add(focusDial, apDial);
  back.visible = false;   // the viewfinder photograph behind the canvas is the backdrop now
  const bk = bokeh(26, { x: 6, y: 3.2, z: 2.6, z0: -0.5 }, 0.1); scene.add(bk.points);
  const ground = floor(5.5); scene.add(ground);
  const dialMats = [focusDial.material, apDial.material] as THREE.MeshBasicMaterial[];

  const lens = new THREE.Vector3(0, 0, 0.3);   // lens front centre in turn space (filled after load)
  let lensR = 0.15, mode: 'dive' | 'compact' = 'dive';
  let p = 0, pt = 0, px = 0, py = 0, tx = 0, ty = 0, loaded = false;
  const parts: Part[] = [];
  let partsParent: THREE.Object3D | null = null;

  const fitDist = () => {
    const a = camera.aspect, tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wantW = mode === 'dive' ? (a > 1.2 ? 0.5 : 0.7) : 0.62;   // share of the viewport width
    const byW = 1.08 / (wantW * 2 * tan * a);
    const byH = 0.62 / ((mode === 'dive' ? 0.46 : 0.5) * 2 * tan);
    return Math.max(byW, byH);
  };

  const ready = new Promise<void>((resolve, reject) => {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('/3d/camera.glb', gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const s = 1 / (box.max.x - box.min.x);
      const c = box.getCenter(new THREE.Vector3());
      model.scale.setScalar(s);
      model.position.set(-c.x * s, -c.y * s, -c.z * s);
      turn.add(model);
      model.updateMatrixWorld(true);

      // lens front (aim of the dive), measured on the intact model
      let barrel: THREE.Object3D | null = null;
      model.traverse(o => { if ((o as THREE.Mesh).isMesh && /lens_body/i.test(((o as THREE.Mesh).material as THREE.Material).name)) barrel = o; });
      const gb = new THREE.Box3().setFromObject(barrel ?? model);
      gb.getCenter(lens); lens.z = gb.max.z;
      lensR = Math.max(gb.max.x - gb.min.x, gb.max.y - gb.min.y) / 2 * .8;

      // split every mesh into its real pieces
      const meshes: THREE.Mesh[] = [];
      model.traverse(o => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
      const axis = new THREE.Vector2();
      let lensAxisSet = false;
      meshes.forEach(m => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.envMapIntensity = 1.15; if (mat.map) mat.map.anisotropy = 8;
        const name = mat.name;
        const pieces = splitIslands(m.geometry);
        if (!lensAxisSet && /lens_body/i.test(name)) { const big = pieces.sort((a, b) => b.size - a.size)[0]; axis.set(big.center.x, big.center.y); lensAxisSet = true; }
        partsParent = m.parent;
        pieces.forEach(pc => {
          const mesh = new THREE.Mesh(pc.geo, mat);
          mesh.position.copy(pc.center);
          m.parent!.add(mesh);
          parts.push({ mesh, home: pc.center.clone(), off: new THREE.Vector3(), axis: new THREE.Vector3(), spin: 0, label: -1, size: pc.size });
          (mesh.userData as { mat: string }).mat = name;
        });
        m.parent!.remove(m); m.geometry.dispose();
      });

      // choreograph: where each piece goes when the camera bursts open
      const bodyMain = parts.filter(pt => /body$/i.test((pt.mesh.userData as { mat: string }).mat)).sort((a, b) => b.size - a.size)[0];
      const rnd = (k: number) => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
      parts.forEach((pt, k) => {
        const mat = (pt.mesh.userData as { mat: string }).mat, c = pt.home;
        const onAxis = Math.hypot(c.x - axis.x, c.y - axis.y) < 0.09;
        if (pt === bodyMain) { pt.label = 6; return; }
        if (onAxis && /lens|strap/i.test(mat)) {
          // the lens telescopes forward; elements further forward travel further
          pt.off.set(0, 0, 0.45 + (c.z + 0.15) * 1.9);
          pt.axis.set(0, 0, 1); pt.spin = (rnd(k) - 0.5) * 1.2;
          pt.label = /lens$/i.test(mat) ? 0 : (/strap/i.test(mat) || c.z < 0.1) ? 2 : 1;
          return;
        }
        const d = new THREE.Vector3(c.x * 0.8, c.y * 1.5, (c.z + 0.34) * 1.3);
        if (d.lengthSq() < 1e-4) d.set(0, 1, 0);
        d.normalize();
        const mag = 0.34 + 0.32 * (1 - clamp01(pt.size / 0.6));
        pt.off.copy(d).multiplyScalar(mag);
        if (c.y > 0.4) pt.off.y += 0.2 + rnd(k) * 0.1;            // top-plate controls lift
        if (c.z < -0.5) pt.off.z -= 0.45;                            // eyepiece / back slides back
        if (c.y < -0.4) pt.off.y -= 0.3;
        pt.axis.set(rnd(k) - 0.5, rnd(k + 1) - 0.5, rnd(k + 2) - 0.5).normalize();
        pt.spin = /lens$/i.test(mat) ? 0 : 0.6 + rnd(k + 3) * 1.4;   // glass windows stay square to the camera
        if (/lens$/i.test(mat) && c.y > 0.3 && c.z > -0.2) pt.label = 3;            // front windows
        else if (c.y > 0.42 && pt.size < 0.4) pt.label = 4;                          // dials
        else if (c.z < -0.5 && c.y > 0.25) pt.label = 5;                             // viewfinder
      });

      const h = (box.max.y - box.min.y) * s;
      shadow.position.y = -h / 2 - 0.004;
      ground.position.y = -h / 2 - 0.006;
      loaded = true;
      stage.warm().then(() => resolve());
    }, undefined, reject);
  });

  let lensCb: ((x: number, y: number, r: number, p: number) => void) | null = null;
  let labelCb: ((l: PartLabel[]) => void) | null = null;
  const lw = new THREE.Vector3(), le = new THREE.Vector3(), tmp = new THREE.Vector3(), q = new THREE.Quaternion();
  const target = new THREE.Vector3(), lookA = new THREE.Vector3(), lookB = new THREE.Vector3();
  const sums = PART_LABELS.map(() => ({ v: new THREE.Vector3(), n: 0 }));
  const labels: PartLabel[] = PART_LABELS.map(() => ({ x: 0, y: 0, o: 0, side: 'r' }));

  const place = (explode: number, tumble: number) => {
    parts.forEach(pt => {
      pt.mesh.position.copy(pt.home).addScaledVector(pt.off, explode);
      if (pt.spin) { q.setFromAxisAngle(pt.axis, pt.spin * tumble); pt.mesh.quaternion.copy(q); }
    });
  };

  stage.onFrame((t, dt) => {
    if (!loaded) return;
    p = damp(p, pt, 7, dt);
    px = damp(px, tx, 3.2, dt); py = damp(py, ty, 3.2, dt);
    const d0 = fitDist();
    bk.update(t);
    back.position.x = -px * 0.12; back.position.y = 0.04 + py * 0.06;

    const dive = true;   // phones get the same story (burst → labels → 360° rebuild → dive); only the framing differs
    // story curves
    const burst = ease3(dive ? (p - 0.05) / 0.15 : (p - 0.06) / 0.22);
    const rebuild = ease3(dive ? (p - 0.40) / 0.14 : (p - 0.56) / 0.24);
    const explode = burst * (1 - rebuild);
    const tumble = Math.sin(Math.PI * clamp01(explode)) * (burst < 1 ? 1 : 0.35) + Math.sin(t * 0.8) * 0.04 * explode;
    const hold = smooth(dive ? (p - 0.12) / 0.3 : (p - 0.2) / 0.36);
    const lab = smooth(dive ? (p - 0.19) / 0.05 : (p - 0.26) / 0.06) * (1 - smooth(dive ? (p - 0.37) / 0.04 : (p - 0.5) / 0.05));
    place(explode, tumble);

    // the whole camera: three-quarter pose → slow turn while exploded → full 360° turn while rebuilding → face-on
    const yaw = (1 - rebuild) * (-0.62 + 0.95 * hold) + rebuild * Math.PI * 2;
    const calm = 1 - rebuild;
    turn.rotation.set((0.16 + 0.1 * explode) * calm, opts.still ? -0.55 : yaw, 0.04 * calm);
    const centring = dive ? smooth((p - 0.52) / 0.1) : 0;
    const eDive = dive ? clamp01((p - 0.56) / 0.18) : 0, k = eDive * eDive * eDive;
    const idle = 1 - centring;
    rig.rotation.set(py * 0.1 * idle + Math.sin(t * 0.7) * 0.012 * idle, px * 0.22 * idle + Math.sin(t * 0.45) * 0.03 * idle, 0);
    rig.position.y = Math.sin(t * 0.9) * 0.008 * idle;
    shadow.material.opacity = (1 - eDive) * (1 - explode * 0.6);

    focusDial.rotation.z = p * 3.2 + t * 0.02;
    apDial.rotation.z = -p * 1.6 - t * 0.012;
    const fade = clamp01(1 - eDive * 1.6);
    dialMats.forEach(m => { m.opacity = fade * (0.62 + explode * 0.25); });
    bk.material.opacity = 0.32 * fade;
    (ground.material as THREE.MeshBasicMaterial).opacity = fade;

    // the exploded camera is wider: pull back while it's open
    const dist = d0 * (1 + 0.62 * explode);
    lookA.set(0, -0.02 + explode * 0.04, 0);
    lookB.set(lens.x, lens.y, lens.z - 1);
    target.lerpVectors(lookA, lookB, smooth(centring * 0.6 + k * 0.4));
    camera.position.set(
      THREE.MathUtils.lerp(0, lens.x, centring),
      THREE.MathUtils.lerp(0.06 + explode * 0.08, lens.y, centring),
      THREE.MathUtils.lerp(dist, lens.z + lensR * 0.55, k),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // labels: average screen position of each labelled group
    if (labelCb && partsParent) {
      sums.forEach(s => { s.v.set(0, 0, 0); s.n = 0; });
      partsParent.updateMatrixWorld(true);
      parts.forEach(pt => { if (pt.label < 0) return; tmp.copy(pt.mesh.position); partsParent!.localToWorld(tmp); sums[pt.label].v.add(tmp); sums[pt.label].n++; });
      sums.forEach((s, i) => {
        const L = labels[i];
        if (!s.n) { L.o = 0; return; }
        tmp.copy(s.v).divideScalar(s.n).project(camera);
        L.x = (tmp.x + 1) / 2 * stage.size.w; L.y = (1 - tmp.y) / 2 * stage.size.h;
        L.side = L.x > stage.size.w / 2 ? 'r' : 'l';
        L.o = lab * clamp01((i + 1) - (1 - lab) * PART_LABELS.length);   // labels arrive one after another
      });
      labelCb(labels);
    }

    if (lensCb && dive) {
      turn.updateMatrixWorld(true);
      lw.copy(lens).applyMatrix4(turn.matrixWorld);
      le.copy(lw); le.x += lensR; le.project(camera);
      lw.project(camera);
      const sx = (lw.x + 1) / 2 * stage.size.w, sy = (1 - lw.y) / 2 * stage.size.h;
      const r = Math.abs(le.x - lw.x) / 2 * stage.size.w;
      lensCb(sx, sy, lw.z < 1 ? r : 9999, p);
    }
  });

  return {
    setProgress: v => { pt = clamp01(v); },
    setPointer: (x, y) => { tx = x; ty = y; },
    setMode: m => { mode = m; },
    onLens: cb => { lensCb = cb; },
    onLabels: cb => { labelCb = cb; },
    ready,
    dispose: stage.dispose,
  };
}
