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

type Part = {
  obj: THREE.Object3D;
  home: THREE.Vector3;
  homeQ: THREE.Quaternion;
  localCenter: THREE.Vector3;
  off: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  label: number;
};

const smooth = (t: number) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const ease3 = (t: number) => { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

/**
 * The hero's 3D Sony Alpha A7 + FE 24-70mm f/2.8 G Master system, animated by its real sub-assemblies.
 * Desktop story (p through a long pinned hero):
 *   .05–.20  burst: the G Master lens telescopes forward ring by ring, the EVF & dials lift, the rear LCD slides back
 *   .20–.40  exploded view turns slowly while seven parts are labelled
 *   .40–.54  everything flies home while the camera makes a full 360° turn, ending face-on
 *   .54–.74  the view dives into the lens, where the page opens into the photographs
 * Phones: the same burst, labels, 360° rebuild and dive, framed for portrait screens.
 */
export function mountHeroCamera(canvas: HTMLCanvasElement, opts: { still?: boolean } = {}): HeroCamera {
  const stage = createStage(canvas, { fov: 28, exposure: 1.08 });
  const { scene, camera } = stage;
  scene.environmentIntensity = 0.95;

  const key = new THREE.DirectionalLight(0xfff1dc, 2.6); key.position.set(-2.2, 2.6, 3); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9d3ff, 0.65); fill.position.set(3, 0.6, 2); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfccc0f, 3.2); rim.position.set(1.6, 1.4, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xc3cc8f, 1.4); rim2.position.set(-2.4, -0.4, -2.2); scene.add(rim2);

  const rig = new THREE.Group(); scene.add(rig);       // pointer + idle sway
  const turn = new THREE.Group(); rig.add(turn);       // scroll-driven turn

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 0.95),
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

  const lens = new THREE.Vector3(0, 0, 0.5);   // lens front centre in turn space (filled after load)
  let lensR = 0.18, mode: 'dive' | 'compact' = 'dive';
  let p = 0, pt = 0, px = 0, py = 0, tx = 0, ty = 0, loaded = false;
  const parts: Part[] = [];

  const fitDist = () => {
    const a = camera.aspect, tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wantW = mode === 'dive' ? (a > 1.2 ? 0.48 : 0.68) : 0.6;   // share of the viewport width
    const byW = 1.18 / (wantW * 2 * tan * a);
    const byH = 0.72 / ((mode === 'dive' ? 0.48 : 0.5) * 2 * tan);
    return Math.max(byW, byH);
  };

  const ready = new Promise<void>((resolve, reject) => {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('/3d/sony-alpha-gm-realistic.glb', gltf => {
      const model = gltf.scene;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const s = 1 / Math.max(0.001, box.max.x - box.min.x);
      const c = box.getCenter(new THREE.Vector3());
      model.scale.setScalar(s);
      model.position.set(-c.x * s, -c.y * s, -c.z * s);
      turn.add(model);
      turn.updateMatrixWorld(true);

      // enhance PBR materials for studio lighting
      model.traverse(o => {
        if ((o as THREE.Mesh).isMesh) {
          const m = o as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach(mat => {
            const std = mat as THREE.MeshStandardMaterial;
            if ('envMapIntensity' in std) std.envMapIntensity = 1.2;
            if (std.map) std.map.anisotropy = 8;
          });
        }
      });

      // locate the body and G Master lens groups
      const bodyGroup = model.getObjectByName('Sony_Alpha_A7_Body');
      const lensGroup = model.getObjectByName('Sony_FE_24_70_F28_GMaster_Lens');

      // measure lens front (aim of the dive) in turn space on the intact model
      const gb = new THREE.Box3().setFromObject(lensGroup ?? model);
      gb.getCenter(lens);
      lens.z = gb.max.z;
      lensR = Math.max(gb.max.x - gb.min.x, gb.max.y - gb.min.y) / 2 * 0.72;

      const rnd = (k: number) => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
      const getCenters = (obj: THREE.Object3D) => {
        const b = new THREE.Box3().setFromObject(obj);
        const worldCenter = b.isEmpty() ? obj.getWorldPosition(new THREE.Vector3()) : b.getCenter(new THREE.Vector3());
        const localCenter = obj.worldToLocal(worldCenter.clone());
        const parentCenter = obj.parent ? obj.parent.worldToLocal(worldCenter.clone()) : worldCenter.clone();
        return { localCenter, parentCenter };
      };

      // choreograph body sub-assemblies
      if (bodyGroup) {
        bodyGroup.children.forEach((child, k) => {
          const { localCenter, parentCenter: pc } = getCenters(child);
          const off = new THREE.Vector3();
          const spinAxis = new THREE.Vector3(0, 1, 0);
          let spin = 0;
          let label = -1;
          const name = child.name;

          if (name === 'Main_Magnesium_Chassis') {
            label = 6;
          } else if (name === 'Pentaprism_EVF_Hump') {
            off.set(0, 1.05, -0.18);
            spinAxis.set(1, 0, 0); spin = -0.14;
            label = 5;
          } else if (name === 'Ergonomic_Leatherette_Grip') {
            const side = pc.x >= 0 ? 1 : -1;
            off.set(side * 0.95, -0.06, 0.35);
            spinAxis.set(0, 1, 0); spin = side * 0.22;
            label = 3;
          } else if (name === 'Anodized_Orange_EMount_Ring') {
            off.set(0, 0, 0.72);
            label = 2;
          } else if (name === 'Rear_Controls_and_LCD') {
            off.set(0, -0.05, -1.15);
            spinAxis.set(1, 0, 0); spin = 0.08;
          } else if (pc.z > 0.35 && Math.hypot(pc.x - 0.14, pc.y + 0.06) < 0.9) {
            // mount flange / lens release near E-mount
            off.set(0, 0, 0.55);
          } else if (pc.y > 0.78) {
            // top plate & control dials lift cleanly upward
            off.set(pc.x * 0.22, 0.78 + rnd(k) * 0.32, pc.z * 0.25);
            spinAxis.set(0, 1, 0); spin = (rnd(k + 2) - 0.5) * 0.9;
            if (pc.x < -0.25) label = 4;
          } else if (pc.y < -0.75) {
            // bottom plate drops down
            off.set(0, -0.72, 0);
          } else {
            // side plates & strap lugs pop outward
            const dir = pc.clone();
            if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
            dir.normalize();
            off.copy(dir).multiplyScalar(0.75 + rnd(k) * 0.25);
            spinAxis.set(rnd(k) - 0.5, rnd(k + 1) - 0.5, rnd(k + 2) - 0.5).normalize();
            spin = 0.35 + rnd(k + 3) * 0.4;
          }

          parts.push({ obj: child, home: child.position.clone(), homeQ: child.quaternion.clone(), localCenter, off, axis: spinAxis, spin, label });
        });
      }

      // choreograph G Master lens assemblies along the +Z optical axis
      if (lensGroup) {
        lensGroup.children.forEach((child, k) => {
          const { localCenter, parentCenter: pc } = getCenters(child);
          const off = new THREE.Vector3();
          const spinAxis = new THREE.Vector3(0, 0, 1);
          let spin = 0;
          let label = -1;
          const name = child.name;

          if (name === 'Front_MultiCoated_Optical_Glass') {
            off.set(0, 0, 3.15);
            label = 0;
          } else if (name === 'Lens_Main_Barrel_Lathe96') {
            off.set(0, 0, 1.15);
            label = 2;
          } else if (name === 'Zoom_Ring_Rubber') {
            off.set(0, 0, 1.65);
            spin = 0.45;
            label = 1;
          } else if (name === 'Focus_Ring_Rubber') {
            off.set(0, 0, 2.35);
            spin = -0.45;
            label = 1;
          } else if (Math.hypot(pc.x, pc.y) > 0.45) {
            // side switches / focus-hold button pop radially + forward with the barrel
            const rad = new THREE.Vector2(pc.x, pc.y).normalize();
            off.set(rad.x * 0.55, rad.y * 0.55, 1.25 + pc.z * 0.45);
          } else {
            // concentric optical elements, 11-blade iris, rear collar & front filter bezel telescope smoothly by Z depth
            const zNorm = clamp01(pc.z / 2.8);
            off.set(0, 0, 0.85 + zNorm * 2.55);
            if (pc.z > 2.45) label = 0;
            else spin = (rnd(k + 7) - 0.5) * 0.4;
          }

          parts.push({ obj: child, home: child.position.clone(), homeQ: child.quaternion.clone(), localCenter, off, axis: spinAxis, spin, label });
        });
      }

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
      pt.obj.position.copy(pt.home).addScaledVector(pt.off, explode);
      if (pt.spin) {
        q.setFromAxisAngle(pt.axis, pt.spin * tumble);
        pt.obj.quaternion.copy(pt.homeQ).multiply(q);
      } else {
        pt.obj.quaternion.copy(pt.homeQ);
      }
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
    const dist = d0 * (1 + 0.72 * explode);
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
    if (labelCb) {
      sums.forEach(s => { s.v.set(0, 0, 0); s.n = 0; });
      turn.updateMatrixWorld(true);
      parts.forEach(pt => {
        if (pt.label < 0) return;
        tmp.copy(pt.localCenter);
        pt.obj.localToWorld(tmp);
        sums[pt.label].v.add(tmp);
        sums[pt.label].n++;
      });
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
