"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Decorative particle-field background for the landing hero. Purely visual —
 * all real content lives in the surrounding HTML, and this fully respects
 * the motionEnabled flag (tied to prefers-reduced-motion + the manual toggle). */
export default function ThreeBackground({ motionEnabled }: { motionEnabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!motionEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const particleCount = window.innerWidth < 768 ? 850 : 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color("#22d3ee");
    const blue = new THREE.Color("#3b82f6");
    const purple = new THREE.Color("#a855f7");

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 20;
      positions[idx + 1] = (Math.random() - 0.5) * 15;
      positions[idx + 2] = (Math.random() - 0.5) * 13;

      const choice = Math.random();
      const selected = choice < 0.45 ? cyan : choice < 0.76 ? blue : purple;
      colors[idx] = selected.r;
      colors[idx + 1] = selected.g;
      colors[idx + 2] = selected.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.027 : 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    const orbGeometry = new THREE.IcosahedronGeometry(1.25, 4);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: "#3b82f6",
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const coreOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    coreOrb.position.set(2.8, 0.1, -3.8);
    scene.add(coreOrb);

    const ringGeometry = new THREE.TorusGeometry(1.72, 0.012, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.19 });
    const ringOne = new THREE.Mesh(ringGeometry, ringMaterial);
    ringOne.position.copy(coreOrb.position);
    ringOne.rotation.x = Math.PI / 3.1;
    scene.add(ringOne);

    const ringTwo = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ringTwo.material.color.set("#a855f7");
    ringTwo.position.copy(coreOrb.position);
    ringTwo.rotation.x = Math.PI / 2.1;
    ringTwo.rotation.y = Math.PI / 4;
    scene.add(ringTwo);

    let animationId: number;
    const animate = () => {
      const time = performance.now() * 0.00023;
      particleSystem.rotation.y = time * 0.45 + mouse.current.x * 0.05;
      particleSystem.rotation.x = mouse.current.y * 0.035;

      coreOrb.rotation.x = time * 2.1;
      coreOrb.rotation.y = time * 2.7;
      coreOrb.position.y = 0.1 + Math.sin(time * 5) * 0.16;

      camera.position.x += (mouse.current.x * 0.22 - camera.position.x) * 0.015;
      camera.position.y += (-mouse.current.y * 0.17 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const onPointerMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      particleMaterial.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [motionEnabled]);

  if (!motionEnabled) return null;
  return <canvas ref={canvasRef} id="threeCanvas" aria-hidden="true" />;
}
