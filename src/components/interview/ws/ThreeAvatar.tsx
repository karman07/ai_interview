import React, { useRef, Suspense, useState, Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

// Ready Player Me full-body avatar — self-hosted in /public
// Model: professional male, full outfit (shirt, pants, shoes, hair, beard)
const AVATAR_URL = '/avatar-v2.glb';

// Viseme pools for lip sync (used when model has OculusVisemes morphs)
const VISEME_OPEN = ['viseme_AA', 'viseme_O', 'viseme_I', 'viseme_E', 'viseme_U'];
const VISEME_TRANS = ['viseme_FF', 'viseme_TH', 'viseme_kk', 'viseme_SS', 'viseme_DD'];

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
    // Error caught by boundary
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

  // Lip sync
  const speechTimer    = useRef(0);
  const currentViseme  = useRef<string | null>(null);

  // Blink state — staggered so first blink isn't immediate
  const blinkTimer     = useRef(Math.random() * 2.5);
  const nextBlink      = useRef(2.5 + Math.random() * 3.5);
  const blinkProgress  = useRef(0);

  // Eye look direction
  const eyeLookTimer   = useRef(0);
  const nextEyeMove    = useRef(1.5 + Math.random() * 2.5);
  const eyeLookTarget  = useRef({ upL: 0, upR: 0, dnL: 0, dnR: 0 });

  const allMeshes = useMemo(() => {
    const meshes: any[] = [];
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) obj.material.envMapIntensity = 0.9;
      }
      if ((obj.isMesh || obj.type?.includes('Mesh')) && obj.morphTargetInfluences && obj.morphTargetDictionary) {
        meshes.push(obj);
      }
    });
    return meshes;
  }, [scene]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Idle breathing + subtle sway
    if (group.current) {
      group.current.position.y = 0 + Math.sin(time * 0.75) * 0.004;
      group.current.rotation.y = Math.sin(time * 0.2) * 0.012;
      group.current.rotation.x = Math.cos(time * 0.28) * 0.005;
    }

    // ── Blink timing (once per frame) ──────────────────────────
    blinkTimer.current += 1 / 60;
    let blinkValue = 0;
    if (blinkTimer.current >= nextBlink.current) {
      blinkProgress.current += 1 / 60;
      if (blinkProgress.current <= 0.07) {
        blinkValue = blinkProgress.current / 0.07;               // close: 70ms
      } else if (blinkProgress.current <= 0.155) {
        blinkValue = Math.max(0, 1 - (blinkProgress.current - 0.07) / 0.085); // open: 85ms
      } else {
        blinkValue = 0;
        blinkProgress.current = 0;
        blinkTimer.current = 0;
        nextBlink.current = 2.5 + Math.random() * 4.5;
      }
    }

    // ── Eye look direction (wanders every 1.5-5s) ──────────────
    eyeLookTimer.current += 1 / 60;
    if (eyeLookTimer.current >= nextEyeMove.current) {
      const r = Math.random();
      let upL = 0, upR = 0, dnL = 0, dnR = 0;
      if (r < 0.3)       { upL = upR = 0.15 + Math.random() * 0.15; }  // glance up
      else if (r < 0.55) { dnL = dnR = 0.12 + Math.random() * 0.1; }   // glance down
      eyeLookTarget.current = { upL, upR, dnL, dnR };
      eyeLookTimer.current = 0;
      nextEyeMove.current = 1.5 + Math.random() * 3.5;
    }

    // ── Viseme selection ───────────────────────────────────────
    if (isSpeaking) {
      speechTimer.current++;
      if (speechTimer.current % 4 === 0) {
        const pool = [...VISEME_OPEN, ...VISEME_TRANS];
        currentViseme.current = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      currentViseme.current = null;
    }

    allMeshes.forEach(obj => {
      const m = obj.morphTargetDictionary as Record<string, number>;
      if (!m) return;

      // LIP SYNC ────────────────────────────────────────────────
      if (isSpeaking) {
        const intensity = 0.45 + Math.sin(time * 14) * 0.35;
        Object.keys(m).forEach(key => {
          if (key.startsWith('viseme_')) {
            obj.morphTargetInfluences[m[key]] = THREE.MathUtils.lerp(
              obj.morphTargetInfluences[m[key]],
              key === currentViseme.current ? intensity : 0,
              0.38
            );
          }
        });
        if (m['jawOpen'] !== undefined) {
          obj.morphTargetInfluences[m['jawOpen']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[m['jawOpen']], intensity * 0.42, 0.32
          );
        }
        if (m['mouthOpen'] !== undefined) {
          obj.morphTargetInfluences[m['mouthOpen']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[m['mouthOpen']],
            0.12 + Math.abs(Math.sin(time * 11)) * 0.38, 0.3
          );
        }
        if (m['mouthSmile'] !== undefined) {
          obj.morphTargetInfluences[m['mouthSmile']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[m['mouthSmile']], 0.15, 0.04
          );
        }
        if (m['browInnerUp'] !== undefined) {
          obj.morphTargetInfluences[m['browInnerUp']] = THREE.MathUtils.lerp(
            obj.morphTargetInfluences[m['browInnerUp']], 0.12, 0.03
          );
        }
      } else {
        Object.keys(m).forEach(key => {
          if (key.startsWith('viseme_') || key.startsWith('mouth') || key.startsWith('jaw') || key === 'browInnerUp') {
            obj.morphTargetInfluences[m[key]] = THREE.MathUtils.lerp(
              obj.morphTargetInfluences[m[key]], 0, 0.08
            );
          }
        });
      }

      // BLINK ───────────────────────────────────────────────────
      if (m['eyeBlinkLeft'] !== undefined) {
        obj.morphTargetInfluences[m['eyeBlinkLeft']]  = blinkValue;
        obj.morphTargetInfluences[m['eyeBlinkRight']] = blinkValue;
      }
      if (m['eyesClosed'] !== undefined) {
        obj.morphTargetInfluences[m['eyesClosed']] = blinkValue;
      }

      // EYE LOOK ────────────────────────────────────────────────
      const { upL, upR, dnL, dnR } = eyeLookTarget.current;
      if (m['eyeLookUpLeft'] !== undefined) {
        obj.morphTargetInfluences[m['eyeLookUpLeft']]    = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyeLookUpLeft']],    upL, 0.04);
        obj.morphTargetInfluences[m['eyeLookUpRight']]   = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyeLookUpRight']],   upR, 0.04);
        obj.morphTargetInfluences[m['eyeLookDownLeft']]  = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyeLookDownLeft']],  dnL, 0.04);
        obj.morphTargetInfluences[m['eyeLookDownRight']] = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyeLookDownRight']], dnR, 0.04);
      }
      if (m['eyesLookUp'] !== undefined) {
        obj.morphTargetInfluences[m['eyesLookUp']]   = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyesLookUp']],   (upL + upR) / 2, 0.04);
        obj.morphTargetInfluences[m['eyesLookDown']] = THREE.MathUtils.lerp(obj.morphTargetInfluences[m['eyesLookDown']], (dnL + dnR) / 2, 0.04);
      }
    });
  });

  // Half-body mesh: Y range 0.286 (chest) → 0.757 (top of hair), no legs
  // Position 0 → natural placement, scale 1.3 fills the frame nicely
  return <primitive object={scene} ref={group} position={[0, -0.3, 0]} scale={1.3} />;
};

// Animated AI bot shown both during loading and as error fallback
const AnimatedAIBot = ({ isSpeaking = false, isListening = false, label }: { isSpeaking?: boolean; isListening?: boolean; label?: string }) => {
  const bars = [0.4, 0.7, 1, 0.7, 0.5, 0.9, 0.6, 1, 0.5, 0.8, 0.4, 0.7, 1, 0.6, 0.5];
  const active = isSpeaking || isListening;
  const color = isListening ? 'bg-emerald-400' : 'bg-blue-400';
  const glowColor = isListening ? 'rgba(52,211,153,0.15)' : 'rgba(59,130,246,0.15)';
  const ringColor = isListening ? 'border-emerald-500/30' : 'border-blue-500/30';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050810] relative overflow-hidden">
      {/* background glow */}
      {active && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ background: `radial-gradient(ellipse at 50% 55%, ${glowColor} 0%, transparent 70%)` }}
        />
      )}

      {/* outer ring */}
      <div className={`relative flex items-center justify-center mb-6`}>
        <div className={`absolute w-36 h-36 rounded-full border ${ringColor} ${active ? 'animate-ping opacity-20' : 'opacity-0'}`} style={{ animationDuration: '2s' }} />
        <div className={`absolute w-28 h-28 rounded-full border ${ringColor} opacity-30 ${active ? 'animate-pulse' : ''}`} />

        {/* bot face */}
        <div className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${active ? (isListening ? 'border-emerald-500/60 bg-emerald-950/30' : 'border-blue-500/60 bg-blue-950/30') : 'border-slate-700 bg-slate-900/50'}`}>
          {/* eyes */}
          <div className="flex gap-3 items-center justify-center">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${active ? (isListening ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]') : 'bg-slate-600'}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${active ? (isListening ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]') : 'bg-slate-600'}`} />
          </div>

          {/* mouth / wave */}
          <div className="absolute bottom-3 flex items-end gap-[2px]">
            {(isSpeaking ? bars : [0.3, 0.5, 0.3, 0.5, 0.3]).map((h, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all ${color} ${isSpeaking ? 'animate-bounce' : ''}`}
                style={{
                  height: `${h * 10}px`,
                  animationDelay: `${i * 60}ms`,
                  animationDuration: `${400 + i * 50}ms`,
                  opacity: isSpeaking ? 0.9 : 0.35,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* sound wave bars */}
      <div className={`flex items-end gap-[3px] h-12 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-20'}`}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full ${color} ${active ? 'animate-bounce' : ''}`}
            style={{
              height: `${h * (active ? 40 : 12)}px`,
              animationDelay: `${i * 50}ms`,
              animationDuration: `${600 + i * 40}ms`,
              transition: 'height 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* label */}
      <p className={`mt-5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isSpeaking ? 'text-blue-400' : isListening ? 'text-emerald-400' : 'text-slate-600'}`}>
        {label ?? (isSpeaking ? 'AI Speaking' : isListening ? 'Listening…' : 'AI Ready')}
      </p>
    </div>
  );
};

const AvatarFallback = () => <AnimatedAIBot label="Syncing..." />;

export const ThreeAvatar = ({ isSpeaking, isListening }: AvatarProps) => {
  return (
    <div className="w-full h-full bg-[#050810] rounded-3xl overflow-hidden relative border border-slate-800/50 shadow-2xl">
      <div className="absolute top-4 left-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 bg-black/40 backdrop-blur-md border border-white/5 ${isSpeaking ? 'text-blue-400 border-blue-500/20' : 'text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
          {isSpeaking ? 'AI Speaking' : 'AI Ready'}
        </div>
      </div>

      <SceneErrorBoundary fallback={<AnimatedAIBot isSpeaking={isSpeaking} isListening={isListening} />}>
        {/*
          Half-body mesh world-space (position=[0,-0.3,0], scale=1.3):
            Chest (mesh bottom)  y = 0.286*1.3 - 0.3 =  0.072
            Eyes                 y = 0.648*1.3 - 0.3 =  0.542
            Top of hair          y = 0.757*1.3 - 0.3 =  0.684
          Camera target [0, 0.38, 0] ≈ chin/lower-face.
          At z=0.85, fov 38 → vertical half-span = tan(19°)*0.85 = 0.293
          View from y=0.087 to y=0.673 → captures full face + shoulders.
        */}
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.45, 0.85], fov: 38 }}>
          <Suspense fallback={<Html center><AvatarFallback /></Html>}>
            <Environment preset="apartment" />
            {/* Warm key light front-left */}
            <directionalLight position={[-1.5, 2, 2]} intensity={1.2} color="#fff5e8" castShadow shadow-mapSize={[1024, 1024]} />
            {/* Cool fill front-right */}
            <directionalLight position={[2, 1, 2]} intensity={0.5} color="#d0e8ff" />
            {/* Soft ambient */}
            <ambientLight intensity={0.3} />
            {/* Blue rim behind for depth */}
            <spotLight position={[0, 3, -2]} intensity={0.65} color="#5580ff" angle={0.7} penumbra={1} />

            <AvatarModel isSpeaking={isSpeaking} isListening={isListening} />

            <ContactShadows opacity={0.3} scale={3} blur={2} far={1.2} position={[0, 0.07, 0]} color="#000010" />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={[0, 0.38, 0]}
            minPolarAngle={Math.PI / 2.3}
            maxPolarAngle={Math.PI / 1.85}
            maxAzimuthAngle={Math.PI / 14}
            minAzimuthAngle={-Math.PI / 14}
          />
        </Canvas>
      </SceneErrorBoundary>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpeaking ? 'opacity-25' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[130px] rounded-full" />
      </div>
    </div>
  );
};

useGLTF.preload('/avatar-v2.glb');
