'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Futuristic 3D backdrop for the home banner: a glowing cinema lens (stacked neon rings around a glass core),
 * a floating film strip, neon light trails with travelling sparks, and a star/particle field.
 * Follows the mouse slightly. Renders nothing (CSS gradient shows) if WebGL is unavailable;
 * holds a still frame for reduced-motion users; pauses when off screen.
 */
export default function CinematicScene({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030f, 0.045);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    const BLUE = new THREE.Color('#3ad6ff');
    const PURPLE = new THREE.Color('#8b5cff');
    const MAGENTA = new THREE.Color('#c04bff');

    // lights
    scene.add(new THREE.AmbientLight(0x6a5cff, 0.35));
    const keyLight = new THREE.PointLight(BLUE, 60, 30);
    keyLight.position.set(-4, 3, 6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(PURPLE, 80, 30);
    rimLight.position.set(5, -2, 4);
    scene.add(rimLight);

    // ── the lens ──
    const lens = new THREE.Group();
    const glow = (c: THREE.Color, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    const metal = new THREE.MeshStandardMaterial({ color: 0x1a1830, metalness: 0.9, roughness: 0.28 });
    const ringSpecs = [
      { r: 2.6, t: 0.16, m: metal }, { r: 2.6, t: 0.03, m: glow(BLUE), z: 0.18 },
      { r: 2.15, t: 0.22, m: metal, z: 0.35 }, { r: 2.15, t: 0.025, m: glow(PURPLE), z: 0.6 },
      { r: 1.7, t: 0.12, m: metal, z: 0.7 }, { r: 1.7, t: 0.02, m: glow(MAGENTA), z: 0.85 },
    ];
    const rings: THREE.Mesh[] = [];
    for (const spec of ringSpecs) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.r, spec.t, 24, 160), spec.m);
      ring.position.z = spec.z ?? 0;
      lens.add(ring);
      rings.push(ring);
    }
    // aperture blades
    const blades = new THREE.Group();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0); bladeShape.lineTo(1.55, 0.25); bladeShape.lineTo(1.4, 0.75); bladeShape.closePath();
    const bladeGeo = new THREE.ShapeGeometry(bladeShape);
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0x120f22, metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide }));
      b.rotation.z = (i / 8) * Math.PI * 2;
      b.position.z = 0.4;
      blades.add(b);
    }
    lens.add(blades);
    // glass core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x1b1240, metalness: 0.1, roughness: 0.05, clearcoat: 1, transmission: 0.2, emissive: PURPLE, emissiveIntensity: 0.25 }),
    );
    core.scale.z = 0.45;
    core.position.z = 0.55;
    lens.add(core);
    const coreGlow = new THREE.Mesh(new THREE.CircleGeometry(1.0, 64), glow(BLUE, 0.18));
    coreGlow.position.z = 1.05;
    lens.add(coreGlow);
    lens.position.set(3.6, 0.2, 0);
    lens.rotation.set(0.25, -0.55, 0);
    scene.add(lens);

    // ── floating film strip ──
    const strip = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0d0b1a, metalness: 0.6, roughness: 0.4 });
    for (let i = 0; i < 9; i++) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.75, 0.04), frameMat);
      frame.position.x = i * 1.15;
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.5), glow(i % 2 ? PURPLE : BLUE, 0.22));
      pane.position.z = 0.03;
      frame.add(pane);
      strip.add(frame);
    }
    strip.position.set(-6.5, -2.9, -3);
    strip.rotation.set(-0.2, 0.35, 0.12);
    scene.add(strip);

    // ── neon light trails with sparks ──
    const trails: { curve: THREE.CatmullRomCurve3; spark: THREE.Mesh; speed: number; offset: number }[] = [];
    const trailDefs = [
      { pts: [[-9, -1.5, -4], [-3, 1.5, -1], [2, -0.5, 1], [9, 2.5, -3]], c: BLUE },
      { pts: [[-9, 2.5, -5], [-2, -1, -2], [4, 2, -1], [9, -2, -4]], c: PURPLE },
      { pts: [[-8, -3.5, -2], [-1, -2.2, 0], [5, -3, -1], [9, -1, -5]], c: MAGENTA },
    ];
    for (const [i, def] of trailDefs.entries()) {
      const curve = new THREE.CatmullRomCurve3(def.pts.map(p => new THREE.Vector3(...(p as [number, number, number]))));
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.012, 8, false), glow(def.c, 0.55)));
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.06, 8, false), glow(def.c, 0.08)));
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), glow(new THREE.Color('#ffffff')));
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), glow(def.c, 0.35));
      spark.add(halo);
      scene.add(spark);
      trails.push({ curve, spark, speed: 0.05 + i * 0.015, offset: i * 0.33 });
    }

    // ── particles ──
    const count = 1400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = -Math.random() * 30 + 4;
      const c = Math.random() > 0.5 ? BLUE : PURPLE;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(particles);

    // ── layout / input ──
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // on narrow screens move the lens up behind the text and pull back
      const narrow = w < 760;
      lens.position.set(narrow ? 0 : 3.6, narrow ? 2.4 : 0.2, narrow ? -2 : 0);
      lens.scale.setScalar(narrow ? 0.75 : 1);
      camera.position.z = narrow ? 15 : 12;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      rings.forEach((r, i) => { r.rotation.z = t * (i % 2 ? -0.25 : 0.15) * (1 + i * 0.1); });
      blades.rotation.z = Math.sin(t * 0.4) * 0.35;
      lens.rotation.y = -0.55 + Math.sin(t * 0.3) * 0.12 + mouse.x * 0.35;
      lens.rotation.x = 0.25 + Math.cos(t * 0.25) * 0.08 + mouse.y * 0.25;
      lens.position.y += (Math.sin(t * 0.8) * 0.002);
      (coreGlow.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(t * 1.6) * 0.06;
      strip.position.x = -6.5 + ((t * 0.35) % 1.15);
      for (const tr of trails) tr.spark.position.copy(tr.curve.getPointAt((t * tr.speed + tr.offset) % 1));
      particles.rotation.y = t * 0.012;
      particles.position.z = (t * 0.6) % 6;
      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      keyLight.position.x = -4 + Math.sin(t * 0.5) * 2;
      renderer.render(scene, camera);
      if (reduce) cancelAnimationFrame(raf); // one still frame
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse(o => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(x => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={className} aria-hidden="true" />;
}
