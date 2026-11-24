import * as THREE from 'three';
import { createStage, clamp01, damp } from './stage';

export function mountEditingStage(canvas: HTMLCanvasElement, still: boolean) {
  const stage = createStage(canvas, { fov: 34, exposure: 1.15 });
  const { scene, camera } = stage;
  camera.position.set(0, .5, 9);
  const rig = new THREE.Group(); scene.add(rig);
  const metal = new THREE.MeshStandardMaterial({ color: '#242920', metalness: .8, roughness: .3 });
  const edge = new THREE.MeshStandardMaterial({ color: '#646d4b', metalness: .65, roughness: .3 });
  const yellow = new THREE.MeshBasicMaterial({ color: '#fccc0f' });
  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, parent = rig) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  box(4.9, 2.95, .14, metal, 0, .75, 0);
  box(.18, .65, .18, edge, 0, -1.02, -.08);
  box(1.8, .09, .65, metal, 0, -1.38, .12);
  const surface = document.createElement('canvas'); surface.width = 1280; surface.height = 720;
  const g = surface.getContext('2d')!;
  g.fillStyle = '#101610'; g.fillRect(0, 0, 1280, 720);
  g.fillStyle = '#222b1b'; g.fillRect(0, 0, 1280, 48);
  g.font = '500 20px sans-serif'; g.fillStyle = '#d4ddbb'; g.fillText('RAKVIH / EDIT STUDIO', 26, 31);
  g.fillStyle = '#94a573'; g.font = '16px sans-serif'; g.fillText('MEDIA', 25, 88);
  for (let i = 0; i < 6; i++) { g.fillStyle = ['#4c5c35', '#746d3c', '#394e42'][i % 3]; g.fillRect(24 + i % 2 * 125, 112 + Math.floor(i / 2) * 85, 112, 70); }
  const sky = g.createLinearGradient(0, 66, 0, 390); sky.addColorStop(0, '#8daaa5'); sky.addColorStop(1, '#e5b365');
  g.fillStyle = sky; g.fillRect(304, 68, 670, 325);
  g.fillStyle = '#f8d979'; g.beginPath(); g.arc(785, 142, 35, 0, Math.PI * 2); g.fill();
  [['#60745a', 255], ['#344c3b', 320], ['#1c3229', 390]].forEach(([colour, y]) => { g.fillStyle = colour as string; g.beginPath(); g.moveTo(304, 393); g.lineTo(304, y as number); for (let i = 0; i < 8; i++) g.lineTo(304 + i * 96, (y as number) - Math.sin(i * 1.8) * 63); g.lineTo(974, 393); g.fill(); });
  g.fillStyle = '#b5bf91'; g.fillText('COLOUR / SCOPES', 1000, 90);
  for (let i = 0; i < 3; i++) { g.strokeStyle = ['#cab846', '#8ca977', '#b68c60'][i]; g.lineWidth = 8; g.beginPath(); g.arc(1095, 150 + i * 82, 27, 0, Math.PI * 2); g.stroke(); }
  for (let row = 0; row < 4; row++) { const y = 456 + row * 53; g.fillStyle = '#20291c'; g.fillRect(22, y, 1236, 42); g.fillStyle = '#c2caad'; g.fillText(row < 2 ? `V${row + 1}` : `A${row - 1}`, 34, y + 27); for (let col = 0; col < 5; col++) { g.fillStyle = row < 2 ? ['#818d47', '#b49b3a', '#61794e'][(col + row) % 3] : '#3c6850'; g.fillRect(100 + col * 230 + (row % 2) * 25, y + 3, 210, 36); if (row > 1) { g.strokeStyle = '#afc895'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x < 200; x += 3) g.lineTo(105 + col * 230 + x, y + 21 + Math.sin(x * .8) * Math.sin(x * .12) * 13); g.stroke(); } } }
  const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
  const display = new THREE.Mesh(new THREE.PlaneGeometry(4.68, 2.63), new THREE.MeshBasicMaterial({ map: texture })); display.position.set(0, .79, .078); rig.add(display);
  const playhead = box(.018, .85, .015, yellow, -1.9, -.03, .1);
  const keyboard = new THREE.Group(); keyboard.position.set(0, -1.44, 1); keyboard.rotation.x = -.9; rig.add(keyboard);
  box(3.1, .95, .08, metal, 0, 0, 0, keyboard);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 14; col++) box(.16, .15, .04, col % 5 === 0 ? yellow : edge, -1.34 + col * .205, -.32 + row * .21, .06, keyboard);
  const clips = new THREE.Group(); rig.add(clips);
  for (let i = 0; i < 5; i++) { const card = box(.9, .28, .08, new THREE.MeshStandardMaterial({ color: ['#fccc0f', '#7d9360', '#bccb8f'][i % 3], metalness: .35, roughness: .4 }), -1.9 + i * .94, -1.95, .5, clips); card.userData.index = i; }
  scene.add(new THREE.HemisphereLight('#f0f3d7', '#171c12', 3));
  const key = new THREE.DirectionalLight('#fff0b2', 5); key.position.set(3, 5, 6); scene.add(key);
  let target = still ? .45 : 0, progress = target;
  stage.onResize((w, h) => { camera.position.z = w / h < 1 ? 12 : 9; camera.updateProjectionMatrix(); });
  stage.onFrame((time, dt) => {
    progress = damp(progress, target, 5, dt);
    rig.rotation.y = still ? -.12 : -.55 + progress * .9;
    rig.rotation.x = still ? .03 : .08 - progress * .12;
    rig.position.y = still ? 0 : Math.sin(time * .65) * .035;
    playhead.position.x = -1.9 + (still ? .45 : progress) * 3.9;
    clips.children.forEach((clip, i) => { clip.position.z = .5 + (1 - progress) * (i % 2 ? 1.4 : 2.4); clip.position.y = -1.95 + (1 - progress) * Math.sin(i * 1.7) * .45; });
  });
  return { setProgress: (p: number) => { target = clamp01(p); }, ready: stage.warm(), dispose: stage.dispose };
}
