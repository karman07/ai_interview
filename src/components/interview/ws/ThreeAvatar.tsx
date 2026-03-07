import React, { useRef, Suspense, useState, Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

// Realistic human model (Ready Player Me) - Corrected URL with morphTarget parameters
const AVATAR_URL = 'https://models.readyplayer.me/646d9dcdc8a5f5bddbfac913.glb?morphTargets=OculusVisemes,ARKit';

// Mapping phonetic-like groups to visemes for procedural lipsync
const VISIME_MAP = {
  mouthOpen: ["viseme_AA", "viseme_O", "viseme_I", "viseme_E", "viseme_U"],
  mouthClosed: ["viseme_PP", "viseme_sil"],
  transitional: ["viseme_FF", "viseme_TH", "viseme_kk", "viseme_SS", "viseme_DD"]
};

// Error Boundary for 3D content
class SceneErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ThreeJS Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const AvatarModel = ({ isSpeaking, isListening }: AvatarProps) => {
  const { scene } = useGLTF(AVATAR_URL) as any;
  const group = useRef<THREE.Group>(null);

  // Track target mouth positions for procedural speech
  const speechTimer = useRef(0);
  const currentViseme = useRef<string | null>(null);

  // References for bone manipulation
  const bones = useRef<{ [key: string]: THREE.Object3D }>({});

  // Memoized mesh identification
  const speakingMeshes = useMemo(() => {
    const meshes: any[] = [];
    console.log("[AvatarModel] Initializing Scene Components...");

    scene.traverse((obj: any) => {
      // 1. Identify Bones
      if (obj.isBone) {
        bones.current[obj.name] = obj;
      }

      // 2. Identify Speaking Meshes (Check for Visemes or ARKit)
      if (obj.isMesh || obj.type.includes('Mesh')) {
        if (obj.morphTargetInfluences && obj.morphTargetDictionary) {
          const keys = Object.keys(obj.morphTargetDictionary);
          const hasVisemes = keys.some(k => k.startsWith('viseme_'));
          const hasARKit = keys.includes('jawOpen') || keys.includes('mouthSmile');

          if (hasVisemes || hasARKit) {
            console.log(`[AvatarModel] SUCCESS: Identified speaking mesh: ${obj.name} (${keys.length} targets)`);
            meshes.push(obj);
          }
        }
      }

      // 3. Material adjustments
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 0.5;
        }
      }
    });

    if (meshes.length === 0) {
      console.warn("[AvatarModel] CRITICAL: No speaking meshes found. Lip-sync disabled.");
    }
    return meshes;
  }, [scene]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (group.current) {
      // Idle movement: subtle breathing and slight sway
      const breathing = Math.sin(time * 0.8) * 0.005;
      group.current.position.y = -1.35 + breathing;
      group.current.rotation.y = Math.sin(time * 0.2) * 0.02;
      group.current.rotation.x = Math.cos(time * 0.3) * 0.01;
    }

    // --- ENHANCED PROCEDURAL LIP SYNC ---
    speakingMeshes.forEach(obj => {
      const morphs = obj.morphTargetDictionary;
      if (!morphs) return;

      if (isSpeaking) {
        speechTimer.current += 1; // Count frames for easier control

        // Rapidly change target visemes for "speech jitter"
        if (speechTimer.current % 5 === 0) { // Every ~80ms at 60fps
          const pool = VISIME_MAP.mouthOpen.concat(VISIME_MAP.transitional);
          currentViseme.current = pool[Math.floor(Math.random() * pool.length)];
        }

        const intensity = 0.4 + Math.sin(time * 12) * 0.4; // Varied intensity

        Object.keys(morphs).forEach(key => {
          if (key.startsWith('viseme_')) {
            const isCurrent = key === currentViseme.current;
            const target = isCurrent ? intensity : 0;

            // Fast lerp for responsive lip movement
            obj.morphTargetInfluences[morphs[key]] = THREE.MathUtils.lerp(
              obj.morphTargetInfluences[morphs[key]],
              target,
              0.3
            );
          }
        });

        // Jaw movement synced with intensity
        if (morphs['jawOpen'] !== undefined) {
          const jawTarget = intensity * 0.5 + (Math.random() * 0.2);
          obj.morphTargetInfluences[morphs['jawOpen']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[morphs['jawOpen']],
            jawTarget,
            0.25
          );
        }

        // Subtle mouth stretch/smile during speech
        if (morphs['mouthSmile'] !== undefined) {
          obj.morphTargetInfluences[morphs['mouthSmile']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[morphs['mouthSmile']],
            0.1,
            0.1
          );
        }
      } else {
        // Return to neutral state
        Object.keys(morphs).forEach(key => {
          if (key.startsWith('viseme_') || key === 'jawOpen' || key === 'mouthSmile') {
            obj.morphTargetInfluences[morphs[key]] = THREE.MathUtils.lerp(
              obj.morphTargetInfluences[morphs[key]],
              0,
              0.15
            );
          }
        });
      }

      // Automatic Blinking
      if (morphs['eyeBlinkLeft'] !== undefined) {
        // Blink pattern: random intervals
        const blinkValue = (Math.sin(time * 2) > 0.995 || Math.sin(time * 5) > 0.99) ? 1 : 0;
        obj.morphTargetInfluences[morphs['eyeBlinkLeft']] = THREE.MathUtils.lerp(obj.morphTargetInfluences[morphs['eyeBlinkLeft']], blinkValue, 0.4);
        obj.morphTargetInfluences[morphs['eyeBlinkRight']] = THREE.MathUtils.lerp(obj.morphTargetInfluences[morphs['eyeBlinkRight']], blinkValue, 0.4);
      }
    });

  });

  return <primitive object={scene} ref={group} position={[0, -1.35, 0]} scale={0.82} />;
};

const AvatarFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#050810] text-slate-500">
    <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin mb-4" />
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Syncing Avatar...</p>
  </div>
);

export const ThreeAvatar = ({ isSpeaking, isListening }: AvatarProps) => {
  return (
    <div className="w-full h-full bg-[#050810] rounded-3xl overflow-hidden relative border border-slate-800/50 shadow-2xl">
      <div className="absolute top-4 left-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 bg-black/40 backdrop-blur-md border border-white/5 ${isSpeaking ? 'text-blue-400 border-blue-500/20' : 'text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
          {isSpeaking ? 'AI Speaking' : 'AI Ready'}
        </div>
      </div>

      <SceneErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-slate-700 text-[10px] uppercase font-bold">Avatar Error</div>}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 1.2], fov: 35 }}>
          <Suspense fallback={<Html center><AvatarFallback /></Html>}>
            <Environment preset="city" />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
            <spotLight position={[0, 5, -5]} intensity={0.5} color="#ffffff" angle={0.5} penumbra={1} />

            <AvatarModel isSpeaking={isSpeaking} isListening={isListening} />

            <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} position={[0, -1.5, 0]} color="#000000" />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2.1}
            maxPolarAngle={Math.PI / 1.9}
            maxAzimuthAngle={Math.PI / 15}
            minAzimuthAngle={-Math.PI / 15}
          />
        </Canvas>
      </SceneErrorBoundary>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpeaking ? 'opacity-25' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[130px] rounded-full" />
      </div>
    </div>
  );
};

// Pre-load corrected URL
useGLTF.preload(AVATAR_URL);
