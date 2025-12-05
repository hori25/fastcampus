'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ProductModel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const capRef = useRef<THREE.Object3D | null>(null); // 뚜껑 메쉬 참조
  const capOriginalY = useRef<number>(0); // 뚜껑 원래 Y 위치
  const capOriginalRotY = useRef<number>(0); // 뚜껑 원래 회전값(Y)
  const rafRef = useRef<number>();

  // 6단계 카메라 포지션 (첫번째와 마지막 동일 - 정면)
  const cameraPositions = [
    // ① 정면 메인샷 (시작)
    { position: { x: 0, y: 0, z: 3.5 }, lookAt: { x: 0, y: 0, z: 0 } },
    // ② 3/4 사선 (뚜껑 열리기 시작)
    { position: { x: 2.2, y: 1.5, z: 2.6 }, lookAt: { x: 0, y: 0.2, z: 0 } },
    // ③ 측면샷 (거의 90도)
    { position: { x: 3.2, y: 1.2, z: 1.8 }, lookAt: { x: 0, y: 0.2, z: 0 } },
    // ④ Top View (위에서 내려다봄 - 훨씬 더 확대)
    { position: { x: 0.5, y: 2.5, z: 0.8 }, lookAt: { x: 0, y: 0.8, z: 0 } },
    // ⑤ 위에서 사선으로 뚜껑 극클로즈업
    { position: { x: 0.8, y: 2.2, z: 0.6 }, lookAt: { x: 0, y: 1.0, z: 0 } },
    // ⑥ 정면 메인샷 (마지막 - 시작과 동일)
    { position: { x: 0, y: 0, z: 3.5 }, lookAt: { x: 0, y: 0, z: 0 } },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera - 첫 번째 포지션으로 시작 (FOV 30으로 더 축소 - 확대/축소 효과 강조)
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(
      cameraPositions[0].position.x,
      cameraPositions[0].position.y,
      cameraPositions[0].position.z
    );
    camera.lookAt(
      cameraPositions[0].lookAt.x,
      cameraPositions[0].lookAt.y,
      cameraPositions[0].lookAt.z
    );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // 간단한 원형 그림자 (그라디언트 원)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(2.5, 2.5);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.7;
    scene.add(shadow);

    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/test_2.glb',
      (gltf) => {
        const model = gltf.scene;
        
        // Center and scale model (스케일 축소)
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.9 / maxDim;
        
        // 정중앙 배치
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;
        
        model.scale.multiplyScalar(scale);
        
        // 뚜껑 메쉬 찾기 (더 강력한 검색)
        let capMesh: THREE.Object3D | null = null;
        
        console.log('========================================');
        console.log('🔍🔍🔍 모든 오브젝트 강력 검색 시작...');
        
        model.traverse((child: any) => {
          const name = child.name || '(unnamed)';
          const type = child.type || '(no type)';
          console.log(`  📦 ${name} | Type: ${type} | Position Y: ${child.position?.y?.toFixed(4) || 'N/A'}`);
          
          // Cap을 찾는 다양한 조건
          if (child.name) {
            const lowerName = child.name.toLowerCase();
            if (lowerName === 'cap' || lowerName.includes('cap') || lowerName.includes('lid') || lowerName.includes('top')) {
              capMesh = child;
              console.log('🎩🎩🎩 Cap 발견!!! 이름:', child.name, '타입:', child.type);
            }
          }
        });
        
        if (capMesh) {
          // 원래 위치를 저장 (스케일 적용 전)
          const capWorldPos = new THREE.Vector3();
          capMesh.getWorldPosition(capWorldPos);
          
          capRef.current = capMesh;
          capOriginalY.current = capMesh.position.y;
          capOriginalRotY.current = capMesh.rotation.y;
          
          console.log('========================================');
          console.log('✅✅✅ 뚜껑 최종 연결 완료!');
          console.log('   이름:', (capMesh as any).name);
          console.log('   타입:', (capMesh as any).type);
          console.log('   로컬 Y:', capMesh.position.y);
          console.log('   월드 Y:', capWorldPos.y);
          console.log('========================================');
        } else {
          console.error('❌❌❌ Cap을 찾지 못했습니다! GLB 파일에 Cap이 없거나 이름이 다릅니다!');
        }
        
        scene.add(model);
        modelRef.current = model;
        
        console.log('test_2.glb 모델 로드 완료 - 스케일:', scale);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Scroll-based camera animation (6 stages)
    const handleScroll = () => {
      if (!cameraRef.current) return;
      
      const section = document.getElementById('product-3d-section');
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      if (rect.top > viewportHeight || rect.bottom < 0) return;
      
      const scrolled = -rect.top;
      const scrollRange = sectionHeight - viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
      
      // 6개 프레임 사이를 보간
      const numFrames = cameraPositions.length;
      const frameIndex = Math.min(Math.floor(progress * (numFrames - 1)), numFrames - 2);
      const startFrame = cameraPositions[frameIndex];
      const endFrame = cameraPositions[frameIndex + 1];
      
      // 구간 내 로컬 progress 계산 (0 ~ 1)
      const localProgress = (progress * (numFrames - 1)) - frameIndex;
      
      // 카메라 위치 보간
      cameraRef.current.position.x = THREE.MathUtils.lerp(
        startFrame.position.x,
        endFrame.position.x,
        localProgress
      );
      cameraRef.current.position.y = THREE.MathUtils.lerp(
        startFrame.position.y,
        endFrame.position.y,
        localProgress
      );
      cameraRef.current.position.z = THREE.MathUtils.lerp(
        startFrame.position.z,
        endFrame.position.z,
        localProgress
      );
      
      // 카메라 lookAt 보간
      const lookAtX = THREE.MathUtils.lerp(
        startFrame.lookAt.x,
        endFrame.lookAt.x,
        localProgress
      );
      const lookAtY = THREE.MathUtils.lerp(
        startFrame.lookAt.y,
        endFrame.lookAt.y,
        localProgress
      );
      const lookAtZ = THREE.MathUtils.lerp(
        startFrame.lookAt.z,
        endFrame.lookAt.z,
        localProgress
      );
      cameraRef.current.lookAt(lookAtX, lookAtY, lookAtZ);
      
      // 뚜껑 열기/닫기 애니메이션 (스크롤 시작하면 바로 열리고, 마지막에 닫힘)
      if (capRef.current) {
        let capOffset = 0;
        const maxOffset = 50.0; // 스프레이가 보일 정도로 크게 열림
        
        // 훨씬 느리게 열렸다가 닫히도록 구간 확장
        // 회전 및 위치 계산
        let capRotY = capOriginalRotY.current;

        if (progress < 0.2) {
          // 0% ~ 20%: 닫힘 유지
          capOffset = 0;
        } else if (progress < 0.6) {
          // 20% ~ 60%: 느리게 열림
          const openProgress = (progress - 0.2) / 0.4;
          const easedOpen = Math.pow(openProgress, 2.4);
          capOffset = easedOpen * maxOffset;
        } else if (progress < 0.8) {
          // 60% ~ 80%: 열린 상태 유지
          capOffset = maxOffset;
        } else {
          // 80% ~ 100%: 천천히 닫힘 + 회전 추가
          const closeProgress = (progress - 0.8) / 0.2;
          const easedClose = Math.pow(closeProgress, 3.0);
          capOffset = maxOffset * (1 - easedClose);
          // 닫히며 회전 (최대 90도)
          capRotY = capOriginalRotY.current + THREE.MathUtils.degToRad(90) * easedClose;
        }
        
        // 뚜껑의 원래 Y 위치에 오프셋 추가
        capRef.current.position.y = capOriginalY.current + capOffset;
        capRef.current.rotation.y = capRotY;
      }
      
      console.log(`📍 Progress: ${progress.toFixed(2)}, Frame: ${frameIndex} -> ${frameIndex + 1}`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
