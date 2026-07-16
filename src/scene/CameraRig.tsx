import { OrbitControls } from "@react-three/drei";

/**
 * Rotation clic-glisser + zoom molette/pincement, avec limites de distance :
 * on peut s'approcher très près de la surface pour observer les cellules.
 */
export function CameraRig() {
  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      minDistance={1.05}
      maxDistance={4.5}
    />
  );
}
