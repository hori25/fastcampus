// Import Three.js from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

// ========================================
// Scene Setup
// ========================================
const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 2);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ========================================
// Lighting - Soft and subtle
// ========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.4);
keyLight.position.set(2, 3, 4);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
rimLight.position.set(-3, 1, -2);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
fillLight.position.set(-2, -1, 2);
scene.add(fillLight);

// ========================================
// Load GLB Model
// ========================================
let model = null;
const loader = new GLTFLoader();

loader.load(
  '../assets/3D/headphone.glb',
  (gltf) => {
    model = gltf.scene;

    // Center and scale model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.2 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.position.z = -1;

    // Apply premium metallic material
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.7;
        child.material.roughness = 0.25;
        child.material.envMapIntensity = 1.2;
      }
    });

    scene.add(model);
    console.log('✅ Model loaded successfully');
  },
  (progress) => {
    console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
  },
  (error) => {
    console.error('❌ Error loading model:', error);
  }
);

// ========================================
// Interaction States
// ========================================
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let scrollProgress = 0;
let targetScrollProgress = 0;

// Mouse parallax
window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  targetRotationY = mouseX * 0.3;
  targetRotationX = mouseY * 0.2;
});

// Scroll reactive
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = 800;
  targetScrollProgress = Math.min(scrollY / maxScroll, 1);
});

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========================================
// Animation Loop
// ========================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  if (model) {
    // 1) Idle floating animation
    const floatY = Math.sin(elapsedTime * 0.7) * 0.03;
    const tiltX = Math.sin(elapsedTime * 0.2) * 0.003;
    const tiltY = Math.cos(elapsedTime * 0.25) * 0.003;

    // 2) Smooth scroll progress with LERP
    scrollProgress = THREE.MathUtils.lerp(
      scrollProgress,
      targetScrollProgress,
      0.05
    );

    // 3) Mouse parallax with damping
    const currentRotationX = THREE.MathUtils.lerp(
      model.rotation.x,
      targetRotationX,
      0.03
    );
    const currentRotationY = THREE.MathUtils.lerp(
      model.rotation.y,
      targetRotationY,
      0.03
    );

    // Scroll-reactive rotation and position
    const scrollRotationY = scrollProgress * 0.6;
    const scrollPositionZ = -1 + scrollProgress * 0.5;

    // Combine all rotations naturally
    model.rotation.x = currentRotationX + tiltX + scrollProgress * 0.2;
    model.rotation.y = currentRotationY + tiltY + scrollRotationY;

    // Position updates
    model.position.y = floatY;
    model.position.z = THREE.MathUtils.lerp(
      model.position.z,
      scrollPositionZ,
      0.05
    );
  }

  // 4) Camera behavior - subtle movement based on scroll
  const targetCameraX = scrollProgress * 0.3;
  camera.position.x = THREE.MathUtils.lerp(
    camera.position.x,
    targetCameraX,
    0.05
  );

  // Always look at model
  if (model) {
    camera.lookAt(model.position);
  } else {
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

// Start animation
animate();

console.log('🚀 VibeX Hero Scene initialized');

