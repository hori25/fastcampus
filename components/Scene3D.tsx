'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Interaction states
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const scrollProgressRef = useRef(0);
  const targetScrollRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup - Deep black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 10, 20);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer setup with tone mapping for premium look
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Balanced exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Balanced lighting to show model naturally
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Key light - main illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    // Rim light - subtle edge highlight (neutral color)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Fill light - reduce shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-2, -2, 3);
    scene.add(fillLight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/assets/3D/headphone.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        // Keep original material colors, only adjust lighting properties
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // Don't change metalness/roughness - keep original material properties
              child.material.needsUpdate = true;
            }
          }
        });

        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );

    // Mouse parallax
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      targetRotationRef.current.y = mouseRef.current.x * 0.3;
      targetRotationRef.current.x = mouseRef.current.y * 0.2;
    };

    // Scroll reactive
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 2000; // Increased for more scroll range
      targetScrollRef.current = Math.min(scrollY / maxScroll, 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // LERP helper
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();

      if (modelRef.current) {
        // 1) Idle floating animation
        const floatY = Math.sin(elapsedTime * 0.7) * 0.03;
        const tiltX = Math.sin(elapsedTime * 0.2) * 0.003;
        const tiltY = Math.cos(elapsedTime * 0.25) * 0.003;

        // 2) Smooth scroll progress with damping
        scrollProgressRef.current = lerp(
          scrollProgressRef.current,
          targetScrollRef.current,
          0.05
        );

        // 3) Mouse parallax with damping
        currentRotationRef.current.x = lerp(
          currentRotationRef.current.x,
          targetRotationRef.current.x,
          0.03
        );
        currentRotationRef.current.y = lerp(
          currentRotationRef.current.y,
          targetRotationRef.current.y,
          0.03
        );

        // Scroll-based rotation - full 360° rotation
        const scrollRotationY = scrollProgressRef.current * Math.PI * 2; // Full rotation
        const scrollRotationX = Math.sin(scrollProgressRef.current * Math.PI) * 0.3; // Gentle tilt
        const scrollRotationZ = Math.sin(scrollProgressRef.current * Math.PI * 2) * 0.1; // Slight roll

        // Combine all rotations naturally
        modelRef.current.rotation.x = 
          currentRotationRef.current.x + 
          tiltX + 
          scrollRotationX;
        
        modelRef.current.rotation.y = 
          currentRotationRef.current.y + 
          tiltY + 
          scrollRotationY;

        modelRef.current.rotation.z = scrollRotationZ;

        // Position updates - move in 3D space as scroll
        const scrollPosY = Math.sin(scrollProgressRef.current * Math.PI) * 0.2; // Up and down
        const scrollPosX = Math.sin(scrollProgressRef.current * Math.PI * 2) * 0.15; // Side to side
        const scrollPosZ = scrollProgressRef.current * 0.8; // Move forward

        modelRef.current.position.y = floatY + scrollPosY;
        modelRef.current.position.x = scrollPosX;
        modelRef.current.position.z = scrollPosZ;
      }

      // 4) Camera behavior - follow the model smoothly
      if (cameraRef.current && modelRef.current) {
        // Camera moves slightly to follow model
        const targetCameraX = scrollProgressRef.current * 0.2;
        const targetCameraY = Math.sin(scrollProgressRef.current * Math.PI) * 0.1;
        
        cameraRef.current.position.x = lerp(
          cameraRef.current.position.x,
          targetCameraX,
          0.05
        );
        cameraRef.current.position.y = lerp(
          cameraRef.current.position.y,
          targetCameraY,
          0.05
        );
        
        // Always look at the model
        cameraRef.current.lookAt(modelRef.current.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0"
        style={{ background: '#000000' }}
      />
      
      {/* Large VIBEX Typography - Behind 3D model */}
      <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center">
        <h1 
          className="text-[20vw] font-bold uppercase leading-none tracking-tighter text-gray-800/40 md:text-[18vw] lg:text-[16vw]"
          style={{ 
            fontFamily: 'Arial Black, sans-serif',
            WebkitTextStroke: '1px rgba(255,255,255,0.05)'
          }}
        >
          VIBE-X
        </h1>
      </div>

      {/* QuietComfort text at bottom center */}
      <div className="pointer-events-none absolute bottom-32 left-1/2 z-10 -translate-x-1/2 text-center">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          <h2 className="mb-2 text-3xl font-light tracking-wide text-white/80 md:text-4xl">
            QuietComfort
          </h2>
          <p className="text-sm tracking-wide text-white/50">
            Sound tailored for you
          </p>
        </div>
      </div>

      {/* [IN] indicator top right */}
      <div className="pointer-events-none absolute right-8 top-8 z-10">
        <span className="text-xs uppercase tracking-wider text-white/30">[IN]</span>
      </div>
    </div>
  );
}

