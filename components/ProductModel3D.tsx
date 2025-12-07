'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

// ----- 재질 설정값 (한 곳에서 조정) -----
// 병 외곽 유리
const BOTTLE_GLASS_MATERIAL_CONFIG = {
  color: 0xffffff,
  metalness: 0.02,       // 거의 비금속
  roughness: 0.01,       // 훨씬 매끈한 유리 (edge 하이라이트 선명하게)
  opacity: 0.92,         // 살짝 더 투명 + 두께감 유지
  envMapIntensity: 2.0,  // 리플렉션을 더 강하게
  ior: 1.48,
  thickness: 0.65,
};

// 내부 액체 (투명한 노란색 느낌)
const LIQUID_MATERIAL_CONFIG = {
  color: 0xffe9a3, // 연한 노란색
  metalness: 0.0,
  roughness: 0.08,
  opacity: 0.65,
  envMapIntensity: 1.0,
  ior: 1.33,
  thickness: 1.0,
};

// 블랙 캡 (무광 플라스틱 느낌)
const CAP_MATERIAL_CONFIG = {
  color: 0x111111,
  metalness: 0.1,
  roughness: 0.5,
  opacity: 1.0,
  envMapIntensity: 0.6,
};

// 라벨/텍스트용 (HDR 반사에 덜 영향을 받게)
const LABEL_MATERIAL_CONFIG = {
  color: 0xffffff, // 필요 시 배경 톤용, 텍스처 색은 유지
  metalness: 0.0,
  roughness: 0.7,  // 더 매트하게 만들어 하이라이트 줄이기
  opacity: 1.0,
  envMapIntensity: 0.0, // 환경맵 영향 거의 제거
};

// 환경맵 / 톤매핑 관련 설정
const ENV_CONFIG = {
  hdrPath: '/hdr/',
  // assets/hdri/hdri-bake-1.exr 를 public/hdr 로 복사해서 사용
  hdrFile: 'hdri-bake-1.exr',
  toneMappingExposure: 1.4, // 전체 노출을 조금 더 올려 하이라이트 강조
};

// ----- 유틸: 액체용 세로 그라디언트 텍스처 (depth 느낌용) -----
let liquidGradientTexture: THREE.CanvasTexture | null = null;

function getLiquidGradientTexture() {
  if (liquidGradientTexture) return liquidGradientTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  // 위쪽: 조금 더 밝고 투명한 노란색
  gradient.addColorStop(0, 'rgba(255, 239, 200, 0.8)');
  // 중간: 기본 액체 색
  gradient.addColorStop(0.5, 'rgba(255, 233, 163, 1.0)');
  // 아래쪽: 살짝 더 진한 톤
  gradient.addColorStop(1, 'rgba(225, 205, 140, 1.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, 256);

  liquidGradientTexture = new THREE.CanvasTexture(canvas);
  liquidGradientTexture.wrapS = THREE.ClampToEdgeWrapping;
  liquidGradientTexture.wrapT = THREE.ClampToEdgeWrapping;
  liquidGradientTexture.needsUpdate = true;
  return liquidGradientTexture;
}

function applyBottleGlassMaterial(material: any) {
  if (!material) return;
  if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) return;

  if (material.color) {
    material.color.set(BOTTLE_GLASS_MATERIAL_CONFIG.color);
  }
  if (typeof material.metalness === 'number') {
    material.metalness = BOTTLE_GLASS_MATERIAL_CONFIG.metalness;
  }
  if (typeof material.roughness === 'number') {
    material.roughness = BOTTLE_GLASS_MATERIAL_CONFIG.roughness;
  }

  material.transparent = true;
  if (typeof material.opacity === 'number') {
    material.opacity = BOTTLE_GLASS_MATERIAL_CONFIG.opacity;
  }
  material.envMapIntensity = BOTTLE_GLASS_MATERIAL_CONFIG.envMapIntensity;
  material.depthWrite = false;
  material.side = THREE.FrontSide;

  if (material.isMeshPhysicalMaterial) {
    material.ior = BOTTLE_GLASS_MATERIAL_CONFIG.ior;
    material.thickness = BOTTLE_GLASS_MATERIAL_CONFIG.thickness;
    // 유리 느낌 강화를 위한 clearcoat / specular
    (material as any).clearcoat = 1.0;
    (material as any).clearcoatRoughness = 0.03;
    if (typeof (material as any).specularIntensity === 'number') {
      (material as any).specularIntensity = 1.0; // edge 하이라이트를 더 강하게
    }
    if ((material as any).specularColor) {
      (material as any).specularColor.set(0xffffff);
    }
    if (typeof material.transmission === 'number') {
      material.transmission = 1.0; // 완전 투명 굴절
    }
  }

  material.needsUpdate = true;
}

function applyLiquidMaterial(material: any) {
  if (!material) return;
  if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) return;

  if (material.color) {
    material.color.set(LIQUID_MATERIAL_CONFIG.color);
  }
  if (typeof material.metalness === 'number') {
    material.metalness = LIQUID_MATERIAL_CONFIG.metalness;
  }
  if (typeof material.roughness === 'number') {
    material.roughness = LIQUID_MATERIAL_CONFIG.roughness;
  }

  material.transparent = true;
  if (typeof material.opacity === 'number') {
    material.opacity = LIQUID_MATERIAL_CONFIG.opacity;
  }
  material.envMapIntensity = LIQUID_MATERIAL_CONFIG.envMapIntensity;
  // 액체가 각도에 따라 사라지지 않도록 살짝 보수적으로 설정
  material.depthWrite = false;
  material.side = THREE.DoubleSide;

   // 깊이감을 주기 위한 세로 그라디언트 텍스처 적용 (이미 map이 없다면)
  const gradientTex = getLiquidGradientTexture();
  if (gradientTex && !material.map) {
    material.map = gradientTex;
    material.map.needsUpdate = true;
  }

  if (material.isMeshPhysicalMaterial) {
    material.ior = LIQUID_MATERIAL_CONFIG.ior;
    material.thickness = LIQUID_MATERIAL_CONFIG.thickness;
    if (typeof material.transmission === 'number') {
      material.transmission = 1.0;
    }
  }

  material.needsUpdate = true;
}

function applyCapMaterial(material: any) {
  if (!material) return;
  if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) return;

  if (material.color) {
    material.color.set(CAP_MATERIAL_CONFIG.color);
  }
  if (typeof material.metalness === 'number') {
    material.metalness = CAP_MATERIAL_CONFIG.metalness;
  }
  if (typeof material.roughness === 'number') {
    material.roughness = CAP_MATERIAL_CONFIG.roughness;
  }

  material.transparent = false;
  if (typeof material.opacity === 'number') {
    material.opacity = CAP_MATERIAL_CONFIG.opacity;
  }
  material.envMapIntensity = CAP_MATERIAL_CONFIG.envMapIntensity;
  material.depthWrite = true;

  if (typeof material.transmission === 'number') {
    material.transmission = 0;
  }

  material.needsUpdate = true;
}

function applyLabelMaterial(material: any) {
  if (!material) return;
  if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) return;

  // 텍스처 색(글자/라벨 디자인)은 그대로 두고, 광원 영향만 조정
  if (typeof material.metalness === 'number') {
    material.metalness = LABEL_MATERIAL_CONFIG.metalness;
  }
  if (typeof material.roughness === 'number') {
    material.roughness = LABEL_MATERIAL_CONFIG.roughness;
  }

  material.transparent = false;
  if (typeof material.opacity === 'number') {
    material.opacity = LABEL_MATERIAL_CONFIG.opacity;
  }
  // 라벨/텍스트는 환경맵 반사를 거의 받지 않도록
  material.envMapIntensity = LABEL_MATERIAL_CONFIG.envMapIntensity;
  material.envMap = null;
  material.side = THREE.FrontSide;
  // 하이라이트/톤매핑 영향도 최대한 줄여서 선명하게 유지
  (material as any).toneMapped = false;

  // 유리와 거의 같은 깊이에 있을 때 z-fighting(지직거림) 방지
  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.polygonOffsetUnits = -1;
  material.depthWrite = true;

  if (typeof material.transmission === 'number') {
    material.transmission = 0;
  }

  material.needsUpdate = true;
}

// GLB 전체에 병 유리 / 레드 액체 / 블랙 캡 재질을 나눠 적용
function enhanceGlassMaterials(root: THREE.Object3D) {
  root.traverse((child: any) => {
    if (!child.isMesh) return;

    // 이름 기반으로 대략적인 파트 구분
    const name = (child.name || '').toLowerCase();
    let part: 'cap' | 'liquid' | 'glass' | 'label' = 'glass';

    if (name.includes('cap') || name.includes('lid') || name.includes('top')) {
      part = 'cap';
    } else if (
      name.includes('label') ||
      name.includes('text') ||
      name.includes('logo') ||
      name.includes('byredo')
    ) {
      part = 'label';
    } else if (
      name.includes('liquid') ||
      name.includes('juice') ||
      name.includes('inner') ||
      name.includes('inside') ||
      name.includes('content')
    ) {
      part = 'liquid';
    }

    // 그림자 설정:
    // - 액체는 그림자 영향 없음 (내부에서만 보이도록)
    // - 병 유리/캡은 외부로 부드러운 그림자를 드리우도록 castShadow 활성화
    if (part === 'liquid') {
      child.castShadow = false;
      child.receiveShadow = false;
    } else {
      child.castShadow = true;
      child.receiveShadow = part === 'glass';
    }

    // 각도에 따라 액체 메쉬가 사라지는 문제 완화:
    // - 액체는 항상 프러스텀 안에 있다고 보고 frustumCulled 끔
    // - 렌더 순서를 고정해서 투명 유리/액체 층이 안정적으로 보이도록
    if (part === 'liquid') {
      child.frustumCulled = false;
      child.renderOrder = 1; // 먼저 렌더
    } else if (part === 'glass') {
      child.renderOrder = 2; // 그 다음 유리
    } else {
      child.renderOrder = 0;
    }

    const apply = (mat: any) => {
      if (part === 'cap') applyCapMaterial(mat);
      else if (part === 'liquid') applyLiquidMaterial(mat);
      else if (part === 'label') applyLabelMaterial(mat);
      else applyBottleGlassMaterial(mat);
    };

    if (Array.isArray(child.material)) {
      child.material.forEach(apply);
    } else {
      apply(child.material);
    }
  });
}

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
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const scrollProgressRef = useRef(0); // 스크롤에서 계산된 목표 progress
  const animProgressRef = useRef(0);   // 애니메이션에서 부드럽게 보간되는 progress

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

    // Renderer - 실사 렌더용으로 업그레이드 (톤매핑/색공간/조명)
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

    // Lights - 스튜디오 조명 느낌 (softbox key + rim + bounce)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Softbox key light - 약간 위에서 사선으로 들어오는 메인 광원
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    // 오른쪽 위에서 사선으로 들어오는 느낌
    keyLight.position.set(4, 7, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    // 병 주변에만 집중되도록 그림자 카메라 영역 제한
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    // 그림자 가장자리 약간 부드럽게
    (keyLight.shadow as any).radius = 4;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // 반대쪽에서 살짝 받쳐주는 bounce light 느낌
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(-3, 3, -4);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 뒤쪽에서 살짝 들어오는 rim light (하이라이트 이동감을 강화)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-4, 6, -4);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // HDRI 기반 환경맵으로 유리/액체 반사 강화 (EXR 사용)
    const exrLoader = new EXRLoader().setPath(ENV_CONFIG.hdrPath);
    exrLoader.load(
      ENV_CONFIG.hdrFile,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      },
      undefined,
      (error) => {
        console.error('Failed to load EXR environment:', error);
      }
    );

    // 바닥 그림자용 평면 (실제 외부로 드리우는 그림자)
    const shadowPlaneGeometry = new THREE.PlaneGeometry(16, 16);
    const shadowPlaneMaterial = new THREE.ShadowMaterial({
      // 사진 촬영 느낌의 부드러운 긴 그림자
      opacity: 0.07,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    // 병이 바닥에 거의 붙어 보이도록 위치 미세 조정
    shadowPlane.position.y = -0.45;
    shadowPlane.receiveShadow = true;
    shadowPlane.name = 'groundShadowPlane';
    scene.add(shadowPlane);

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
          (capMesh as THREE.Object3D).getWorldPosition(capWorldPos);
          
          capRef.current = capMesh;
          capOriginalY.current = (capMesh as THREE.Object3D).position.y;
          capOriginalRotY.current = (capMesh as THREE.Object3D).rotation.y;
          
          console.log('========================================');
          console.log('✅✅✅ 뚜껑 최종 연결 완료!');
          console.log('   이름:', (capMesh as any).name);
          console.log('   타입:', (capMesh as any).type);
          console.log('   로컬 Y:', (capMesh as THREE.Object3D).position.y);
          console.log('   월드 Y:', capWorldPos.y);
          console.log('========================================');
        } else {
          console.error('❌❌❌ Cap을 찾지 못했습니다! GLB 파일에 Cap이 없거나 이름이 다릅니다!');
        }
        
        scene.add(model);
        modelRef.current = model;

        // GLB 로딩 후 유리 재질 보정 적용
        enhanceGlassMaterials(model);
        
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
      // 카메라/조명 애니메이션은 별도 루프에서 부드럽게 보간하기 위해 값만 저장
      scrollProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      if (!cameraRef.current || !rendererRef.current) return;

      // 스크롤 값과 실제 조명 애니메이션을 분리해서 부드럽게 보간
      const target = scrollProgressRef.current;
      animProgressRef.current = THREE.MathUtils.lerp(
        animProgressRef.current,
        target,
        0.08 // 값이 클수록 더 빠르게 따라감
      );
      const progress = animProgressRef.current;

      // 6개 프레임 사이를 보간 (부드럽게)
      const numFrames = cameraPositions.length;
      const frameIndex = Math.min(Math.floor(progress * (numFrames - 1)), numFrames - 2);
      const startFrame = cameraPositions[frameIndex];
      const endFrame = cameraPositions[frameIndex + 1];

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

      // 뚜껑 열기/닫기 애니메이션도 같은 progress에 맞춰 부드럽게
      if (capRef.current) {
        let capOffset = 0;
        const maxOffset = 50.0;

        let capRotY = capOriginalRotY.current;
        if (progress < 0.2) {
          capOffset = 0;
        } else if (progress < 0.6) {
          const openProgress = (progress - 0.2) / 0.4;
          const easedOpen = Math.pow(openProgress, 2.4);
          capOffset = easedOpen * maxOffset;
        } else if (progress < 0.8) {
          capOffset = maxOffset;
        } else {
          const closeProgress = (progress - 0.8) / 0.2;
          const easedClose = Math.pow(closeProgress, 3.0);
          capOffset = maxOffset * (1 - easedClose);
          capRotY = capOriginalRotY.current + THREE.MathUtils.degToRad(90) * easedClose;
        }

        capRef.current.position.y = capOriginalY.current + capOffset;
        capRef.current.rotation.y = capRotY;
      }

      const keyLight = keyLightRef.current;
      const rimLight = rimLightRef.current;
      if (keyLight && rimLight) {
        const angle = progress * Math.PI * 1.5; // 약 270도 회전
        const radius = 5;

        keyLight.position.x = Math.cos(angle) * radius;
        keyLight.position.z = Math.sin(angle) * radius + 2;
        keyLight.position.y = 6 + 1.5 * Math.sin(angle * 0.5);

        keyLight.intensity = 2.2 + 0.8 * Math.max(0, Math.sin(angle + Math.PI / 4));

        rimLight.position.x = -keyLight.position.x * 0.6;
        rimLight.position.z = -keyLight.position.z * 0.6;
        rimLight.position.y = 5.5;
        rimLight.intensity = 0.25 + 0.25 * (1 - Math.cos(angle));
      }

      rendererRef.current.render(scene, cameraRef.current);
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


