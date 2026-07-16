import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Globe } from "./scene/Globe";
import { LifeGrid } from "./scene/LifeGrid";
import { CameraRig } from "./scene/CameraRig";
import { HUD } from "./ui/HUD";
import { StatsPanel } from "./ui/StatsPanel";
import { SettingsPanel } from "./ui/SettingsPanel";
import { useSimulationStore } from "./store/simulationStore";

/** Groupe globe + cellules, avec rotation lente optionnelle. */
function World() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current && useSimulationStore.getState().autoRotate) {
      group.current.rotation.y += delta * 0.04;
    }
  });
  return (
    <group ref={group}>
      <Globe />
      <LifeGrid />
    </group>
  );
}

export default function App() {
  const ready = useSimulationStore((s) => s.ready);
  const init = useSimulationStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas camera={{ position: [0, 0.35, 2.8], fov: 42, near: 0.01, far: 50 }} dpr={[1, 2]}>
        <color attach="background" args={["#020509"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 2, 4]} intensity={2.1} />
        <Suspense fallback={null}>
          <World />
        </Suspense>
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={1} mipmapBlur radius={0.65} />
        </EffectComposer>
      </Canvas>

      <HUD />
      <StatsPanel />
      <SettingsPanel />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020509]">
          <div className="text-[10px] uppercase tracking-[0.45em] text-slate-500">
            Chargement du terrain
          </div>
        </div>
      )}
    </div>
  );
}
