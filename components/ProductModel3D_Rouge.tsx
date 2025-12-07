'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

// ----- Rouge Chaotique 전용 재질 설정 -----
const BOTTLE_GLASS_MATERIAL_CONFIG = {
  // 자연스럽고 투명한 크리스탈 유리
  color: 0xffffff,
  metalness: 0.0,
  roughness: 0.0,
  opacity: 1.0,
  envMapIntensity: 2.5,  // 적당한 반사
  ior: 1.6,              // 일반적인 묵직한 유리 굴절률
  thickness: 1.2,        // 너무 두껍지 않게 해서 맑은 느낌 유지
  transmission: 1.0,     // 빛 완전 투과
  clearcoat: 1.0,
  clearcoatRoughness: 0.0,
};

const LIQUID_MATERIAL_CONFIG = {
  color: 0x900020,   // 0x750023 -> 0x900020 (조금 더 채도 높은 선명한 와인색)
  metalness: 0.1,    // 금속성 살짝 추가해서 깊이감
  roughness: 0.25,   // 빛을 좀 더 머금도록
  opacity: 1.0,      // 불투명 유지
  envMapIntensity: 1.0,
  ior: 1.35,
  thickness: 1.5,
};

const ENV_CONFIG = {
  // Rouge Chaotique에 어울리는 약간 어두운 스튜디오 HDRI
  hdrPath: '/assets/hdri/',
  hdrFile: 'envmap-liquid.exr',
  toneMappingExposure: 1.2,
};

export default function ProductModel3D_Rouge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const capRef = useRef<THREE.Object3D | null>(null);
  const capOriginalY = useRef<number>(0);
  const capOriginalRotY = useRef<number>(0);
  const rafRef = useRef<number>();
  
  // 등장 애니메이션용 초기 회전값 (약 45도에서 시작)
  const initialRotationRef = useRef(Math.PI / 4);
  const isLoadedRef = useRef(false);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const scrollProgressRef = useRef(0);
  const animProgressRef = useRef(0);

  // 6단계 카메라 포지션
  const cameraPositions = [
    { position: { x: 0, y: 0, z: 3.5 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: 2.2, y: 1.5, z: 2.6 }, lookAt: { x: 0, y: 0.2, z: 0 } },
    { position: { x: 3.2, y: 1.2, z: 1.8 }, lookAt: { x: 0, y: 0.2, z: 0 } },
    // ④ Top View: 더 줌인(확대)되도록 카메라 위치를 병에 가깝게 조정
    { position: { x: 0.3, y: 1.8, z: 0.5 }, lookAt: { x: 0, y: -0.2, z: 0 } },
    { position: { x: 0.8, y: 2.2, z: 0.6 }, lookAt: { x: 0, y: 1.0, z: 0 } },
    { position: { x: 0, y: 0, z: 3.5 }, lookAt: { x: 0, y: 0, z: 0 } },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // 배경은 투명하게 처리하고 CSS로 그라데이션 제어
    scene.background = null;
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = ENV_CONFIG.toneMappingExposure;
    (renderer as any).physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    // Ambient soft 추가 - 전체적으로 화사하게 (0.5 -> 0.4 조금 더 차분하게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key light (Strong highlight)
    // 강도 1.5 (너무 쨍하지 않게)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    // 위치 조정: 너무 Top 조명 같지 않게 높이(y)를 낮추고 앞쪽(z)으로 당김 (2, 2.5, 2 -> 2, 1.5, 3)
    keyLight.position.set(2, 1.5, 3); 
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(4096, 4096);
    (keyLight.shadow as any).radius = 1.5;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill light (어두운쪽 톤 살림) - 약간 더 밝게
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-2, 1, 1);
    scene.add(fillLight);

    // Rim light (유리 엣지 강조) - 자연스럽게 조절 (2.0 -> 1.5)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 2, -3); 
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 병 뒤쪽에서 액체를 통과해 오는 백라이트 (핑크빛 톤으로 와인색 강조)
    // 1.2 -> 0.8 (은은하게)
    const backLight = new THREE.DirectionalLight(0xffe5e5, 0.8); 
    backLight.position.set(0, 1.5, -4.0);
    scene.add(backLight);

    // HDRI Loader
    const exrLoader = new EXRLoader().setPath(ENV_CONFIG.hdrPath);
    
    // 기본(Liquid) HDRI 로드
    exrLoader.load(ENV_CONFIG.hdrFile, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });


    // Shadow Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.45;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Load GLTF
    const loader = new GLTFLoader();
    loader.load(
      '/models/Byredo_Rouge_Chaotique_Eau_de_Parfum_blender3.glb',
      (gltf) => {
        const model = gltf.scene;
        
        // Scale & Center
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.9 / maxDim;
        
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;
        model.scale.multiplyScalar(scale);
        
        // Find parts
        model.traverse((child: any) => {
          if (!child.isMesh) return;
          
          const name = (child.name || '').toLowerCase();
          
          if (name.includes('cap') || name.includes('lid')) {
            capRef.current = child;
            // 캡 재질 보정: 더 고급스럽고 자연스러운 반광
            if (child.material) {
              // MeshPhysicalMaterial로 교체하거나 속성 조정
              // 기존 재질이 MeshStandardMaterial일 가능성이 높으므로 속성만 조정
              child.material.roughness = 0.25; // 0.3 -> 0.25 (하이라이트 좀 더 명확하게)
              child.material.metalness = 0.1;
              
              // 가능하다면 clearcoat 추가 (재질 타입에 따라 다름)
              if (child.material.isMeshPhysicalMaterial) {
                  child.material.clearcoat = 0.3;
                  child.material.clearcoatRoughness = 0.2;
              }
            }
            child.renderOrder = 0; // Cap rendered first
          } else if (name.includes('nozzle') || name.includes('spray') || name.includes('pump') || name.includes('metal')) {
            // 스프레이 노즐: 블랙 메탈로 복구하되, 그림자는 제거
            if (child.material) {
              child.material.color.set(0x111111); // 고급스러운 블랙
              child.material.metalness = 0.8;     // 금속 질감
              child.material.roughness = 0.2;     // 적당한 광택
              
              // 그림자/AO 영향 제거해서 형태가 뭉개지지 않게 함
              child.material.aoMapIntensity = 0.0;
              child.material.envMapIntensity = 1.5; 
            }
            child.castShadow = false;
            child.receiveShadow = false; // 핵심: 그림자를 받지 않게 설정 // 굳이 그림자를 만들 필요 없음 (작은 부품이라)
          } else if (name.includes('bottle') || name.includes('glass')) {
            // 유리 재질 보정 (투명하게)
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 유리 재질 강제 교체 (MeshPhysicalMaterial)
            const m = new THREE.MeshPhysicalMaterial({
              color: BOTTLE_GLASS_MATERIAL_CONFIG.color,
              metalness: BOTTLE_GLASS_MATERIAL_CONFIG.metalness,
              roughness: BOTTLE_GLASS_MATERIAL_CONFIG.roughness,
              opacity: BOTTLE_GLASS_MATERIAL_CONFIG.opacity,
              transmission: BOTTLE_GLASS_MATERIAL_CONFIG.transmission,
              transparent: true,
              envMapIntensity: BOTTLE_GLASS_MATERIAL_CONFIG.envMapIntensity,
              ior: BOTTLE_GLASS_MATERIAL_CONFIG.ior,
              thickness: BOTTLE_GLASS_MATERIAL_CONFIG.thickness,
              clearcoat: BOTTLE_GLASS_MATERIAL_CONFIG.clearcoat,
              clearcoatRoughness: BOTTLE_GLASS_MATERIAL_CONFIG.clearcoatRoughness,
              side: THREE.FrontSide,
            });
            
            // 병 유리는 색을 거의 먹지 않게 → 유리는 완전 투명
            (m as any).attenuationColor = new THREE.Color(0xffffff);
            (m as any).attenuationDistance = 100; // 사실상 흡수 없음
            
            child.material = m;
            child.renderOrder = 2; // 액체(1)보다 나중에 그림 -> 투명 유리 안에 불투명 액체가 보이도록
          } else if (name.includes('volume') || name.includes('liquid')) {
            // 액체 재질 보정 (와인색)
            const m = new THREE.MeshPhysicalMaterial({
              color: LIQUID_MATERIAL_CONFIG.color,
              metalness: LIQUID_MATERIAL_CONFIG.metalness,
              roughness: LIQUID_MATERIAL_CONFIG.roughness,
              opacity: 1.0, // 불투명하게 설정해서 색이 확실히 보이도록
              transmission: 0.0, // 투명도 제거
              transparent: false,
              side: THREE.DoubleSide,
              envMapIntensity: LIQUID_MATERIAL_CONFIG.envMapIntensity,
            });
            // 내부 흡수색 제거 (불투명하므로 불필요)
            
            child.material = m;
            child.renderOrder = 1; // 유리보다 먼저 그려지도록 (안쪽에 있으므로)
          } else if (name.includes('logo') || name.includes('label')) {
            // 라벨 투명하게 + 텍스트 화이트로
            if (child.material) {
              // 텍스트 색상을 완전 화이트로 고정
              if (child.material.color) {
                child.material.color.set(0xffffff);
              }
              
              child.material.transparent = true;
              child.material.opacity = 0.25; // 0.35 -> 0.25 (정면에서 액체 색이 더 잘 비치도록)
              child.material.depthWrite = false; 
              child.material.polygonOffset = true;
              child.material.polygonOffsetFactor = -1;
              
              // 흰색이 더 잘 보이도록 emissive 추가 (강도 높임)
              if (child.material.emissive) {
                child.material.emissive.set(0xffffff);
                child.material.emissiveIntensity = 0.8; // 0.2 -> 0.8 (훨씬 더 하얗게 빛나도록)
              }
            }
            child.renderOrder = 4; // Label rendered last
          }
        });

        if (capRef.current) {
          capOriginalY.current = capRef.current.position.y;
          capOriginalRotY.current = capRef.current.rotation.y;
        }

        // 초기 회전 설정 (사선)
        model.rotation.y = initialRotationRef.current;
        isLoadedRef.current = true;
        
        scene.add(model);
        modelRef.current = model;
      }
    );

    // Scroll Handler
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
      scrollProgressRef.current = Math.max(0, Math.min(1, scrolled / scrollRange));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Animate
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      if (!cameraRef.current || !rendererRef.current) return;

      // Lerp Progress
      const target = scrollProgressRef.current;
      animProgressRef.current = THREE.MathUtils.lerp(animProgressRef.current, target, 0.08);
      const progress = animProgressRef.current;

      // [추가] 등장 애니메이션: 로딩 직후 사선에서 정면으로 부드럽게 회전
      if (isLoadedRef.current && modelRef.current && progress < 0.01) {
        // 초기 회전값에서 0으로 lerp (0.05 -> 0.02로 속도 늦춤)
        initialRotationRef.current = THREE.MathUtils.lerp(initialRotationRef.current, 0, 0.02);
        modelRef.current.rotation.y = initialRotationRef.current;
      } else if (modelRef.current && progress >= 0.01) {
        // 스크롤 시작되면 정면 고정 (혹은 스크롤에 따른 회전 로직이 있다면 그쪽으로)
        modelRef.current.rotation.y = 0;
      }

      // Camera Interpolation
      const numFrames = cameraPositions.length;
      const frameIndex = Math.min(Math.floor(progress * (numFrames - 1)), numFrames - 2);
      const startFrame = cameraPositions[frameIndex];
      const endFrame = cameraPositions[frameIndex + 1];
      const localProgress = (progress * (numFrames - 1)) - frameIndex;

      cameraRef.current.position.x = THREE.MathUtils.lerp(startFrame.position.x, endFrame.position.x, localProgress);
      cameraRef.current.position.y = THREE.MathUtils.lerp(startFrame.position.y, endFrame.position.y, localProgress);
      cameraRef.current.position.z = THREE.MathUtils.lerp(startFrame.position.z, endFrame.position.z, localProgress);

      const lx = THREE.MathUtils.lerp(startFrame.lookAt.x, endFrame.lookAt.x, localProgress);
      const ly = THREE.MathUtils.lerp(startFrame.lookAt.y, endFrame.lookAt.y, localProgress);
      const lz = THREE.MathUtils.lerp(startFrame.lookAt.z, endFrame.lookAt.z, localProgress);
      cameraRef.current.lookAt(lx, ly, lz);

      // Cap Animation
      if (capRef.current) {
        let capOffset = 0;
        let capRotY = capOriginalRotY.current;
        const maxOffset = 50.0;

        if (progress > 0.2 && progress < 0.8) {
          const openProgress = Math.min(1, (progress - 0.2) / 0.4);
          capOffset = Math.pow(openProgress, 2) * maxOffset;
        } else if (progress >= 0.8) {
          // 0.8 ~ 1.0 구간에서 부드럽게 닫힘
          const closeProgress = (progress - 0.8) / 0.2;
          // 1.0에서 0이 되도록 (닫힘)
          capOffset = maxOffset * (1 - Math.pow(closeProgress, 2));
        }
        capRef.current.position.y = capOriginalY.current + capOffset;
      }

      // Light Animation
      if (keyLightRef.current && rimLightRef.current) {
        // 탑뷰라고 해서 조명을 바꾸지 않고, 정면과 동일한 스튜디오 조명 유지
        // Key Light 고정: 높이 낮추고 앞으로 (2, 1.5, 3)
        keyLightRef.current.position.set(2, 1.5, 3);
        keyLightRef.current.intensity = 1.5;

        // Rim Light는 이미 고정되어 있음 (0, 2, -3)
      }

      rendererRef.current.render(scene, cameraRef.current);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
