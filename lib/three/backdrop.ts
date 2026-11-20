import * as THREE from 'three';

/**
 * Scenery shared by the 3D plates: an engraved lens focus dial, drifting bokeh,
 * a fading studio floor and an acoustic-foam wall. All cheap: a few textured planes,
 * one Points cloud and one InstancedMesh.
 */

/** A lens barrel face (focus + aperture scales) drawn once on a canvas; transparent outside the rings. */
export function lensDialTexture(kind: 'focus' | 'aperture') {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d')!, C = S / 2;
  g.translate(C, C);
  const ring = (r0: number, r1: number, fill: string) => { g.beginPath(); g.arc(0, 0, r1, 0, Math.PI * 2); g.arc(0, 0, r0, 0, Math.PI * 2, true); g.fillStyle = fill; g.fill(); };
  if (kind === 'focus') {
    ring(C * 0.80, C * 0.98, 'rgba(239,235,223,.035)');
    g.strokeStyle = 'rgba(239,235,223,.22)'; g.lineWidth = 3;
    for (const r of [0.80, 0.98]) { g.beginPath(); g.arc(0, 0, C * r, 0, Math.PI * 2); g.stroke(); }
    // knurling
    g.strokeStyle = 'rgba(239,235,223,.08)'; g.lineWidth = 4;
    for (let k = 0; k < 360; k++) { const a = k / 360 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * C * 0.93, Math.sin(a) * C * 0.93); g.lineTo(Math.cos(a) * C * 0.975, Math.sin(a) * C * 0.975); g.stroke(); }
    const marks = ['∞', '10', '5', '3', '2', '1.5', '1.2', '1', '0.8', '0.7m'];
    g.font = `600 ${S * 0.03}px -apple-system, "SF Pro Display", Helvetica, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    marks.forEach((m, i) => {
      const a = -Math.PI * 0.9 + i * (Math.PI * 1.1 / (marks.length - 1));
      g.save(); g.rotate(a + Math.PI / 2); g.fillStyle = i === 0 ? 'rgba(252,204,15,.85)' : 'rgba(239,235,223,.55)'; g.fillText(m, 0, -C * 0.865); g.restore();
      g.save(); g.rotate(a); g.strokeStyle = 'rgba(239,235,223,.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(C * 0.80, 0); g.lineTo(C * 0.83, 0); g.stroke(); g.restore();
    });
  } else {
    ring(C * 0.56, C * 0.74, 'rgba(239,235,223,.03)');
    g.strokeStyle = 'rgba(239,235,223,.18)'; g.lineWidth = 3;
    for (const r of [0.56, 0.74]) { g.beginPath(); g.arc(0, 0, C * r, 0, Math.PI * 2); g.stroke(); }
    const stops = ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22'];
    g.font = `500 ${S * 0.026}px -apple-system, "SF Pro Text", Helvetica, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    stops.forEach((m, i) => {
      const a = Math.PI * 0.15 + i * (Math.PI * 0.95 / (stops.length - 1));
      g.save(); g.rotate(a + Math.PI / 2); g.fillStyle = 'rgba(195,204,143,.6)'; g.fillText(m, 0, -C * 0.65); g.restore();
    });
    // the brand-yellow index line
    g.fillStyle = 'rgba(252,204,15,.9)'; g.fillRect(-3, -C * 0.79, 6, C * 0.06);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function dial(kind: 'focus' | 'aperture', size: number) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: lensDialTexture(kind), transparent: true, depthWrite: false, toneMapped: false }));
  return m;
}

function softDot() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!, gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,.55)'); gr.addColorStop(0.72, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Out-of-focus light orbs drifting in a box. Call `update(t)` each frame. */
export function bokeh(count: number, box: { x: number; y: number; z: number; z0: number }, size = 0.16) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count);
  const palette = [new THREE.Color(0xfccc0f), new THREE.Color(0xc3cc8f), new THREE.Color(0xffe6a8), new THREE.Color(0xefebdf)];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * box.x; pos[i * 3 + 1] = (Math.random() - 0.5) * box.y; pos[i * 3 + 2] = box.z0 - Math.random() * box.z;
    const cc = palette[i % palette.length]; col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
    seed[i] = Math.random() * 100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, map: softDot(), vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false });
  const pts = new THREE.Points(geo, mat);
  const base = pos.slice();
  return {
    points: pts, material: mat,
    update(t: number) {
      const a = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const s = seed[i];
        a.array[i * 3] = base[i * 3] + Math.sin(t * 0.13 + s) * 0.12;
        a.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.17 + s * 1.7) * 0.09 + ((t * 0.02 + s) % 1) * 0.05;
      }
      a.needsUpdate = true;
    },
  };
}

/** A soft pool of light on a dark studio floor; unlit, so it never flares, and its edges fade to nothing. */
export function floor(size: number) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d')!, gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  gr.addColorStop(0, 'rgba(58,56,30,.55)'); gr.addColorStop(0.35, 'rgba(30,32,20,.45)'); gr.addColorStop(0.7, 'rgba(14,15,10,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** Pyramid acoustic foam, laid out in alternating 4×4 tiles like a real treated wall. */
export function foamWall(cols: number, rows: number, cell = 0.1) {
  const geo = new THREE.ConeGeometry(cell * 0.7, cell * 0.55, 4, 1);
  geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 4);
  const mat = new THREE.MeshStandardMaterial({ color: 0x101108, roughness: 0.96, metalness: 0, envMapIntensity: 0.25 });
  const mesh = new THREE.InstancedMesh(geo, mat, cols * rows);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  let i = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const tile = (Math.floor(x / 4) + Math.floor(y / 4)) % 2;
    s.set(1, 1, tile ? 0.75 : 1);
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), tile ? Math.PI / 4 : 0);
    p.set((x - cols / 2 + 0.5) * cell, (y - rows / 2 + 0.5) * cell, 0);
    m4.compose(p, q, s); mesh.setMatrixAt(i++, m4);
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(cols * cell, rows * cell), new THREE.MeshStandardMaterial({ color: 0x0c0d09, roughness: 1 }));
  back.position.z = -0.02;
  const g = new THREE.Group(); g.add(back, mesh);
  return g;
}
