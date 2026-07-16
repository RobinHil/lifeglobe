import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useSimulationStore, getTerrain } from "../store/simulationStore";
import colorUrl from "../assets/earth-color.jpg";

export const GLOBE_RADIUS = 1;

const HOLO_VERTEX = /* glsl */ `
  varying float vFresnel;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vec3 viewDir = normalize(-mvPos.xyz);
    vFresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.4);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const HOLO_FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  varying float vFresnel;
  void main() {
    vec3 col = mix(uBase, uRim, vFresnel);
    float alpha = 0.72 + 0.28 * vFresnel;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Texture des contours de continents, générée une fois depuis le masque terre/océan. */
function useContourTexture(): THREE.CanvasTexture | null {
  const ready = useSimulationStore((s) => s.ready);
  return useMemo(() => {
    if (!ready) return null;
    const src = getTerrain();
    if (!src) return null;

    const { data, width: w, height: h, brightIsLand } = src;
    const land = (x: number, y: number) => {
      const xx = x < 0 ? w - 1 : x >= w ? 0 : x;
      const yy = Math.min(h - 1, Math.max(0, y));
      return data[(yy * w + xx) * 4] > 128 === brightIsLand;
    };

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const out = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!land(x, y)) continue;
        const edge = !land(x - 1, y) || !land(x + 1, y) || !land(x, y - 1) || !land(x, y + 1);
        if (!edge) continue;
        const i = (y * w + x) * 4;
        out.data[i] = 110;
        out.data[i + 1] = 222;
        out.data[i + 2] = 255;
        out.data[i + 3] = 225;
      }
    }
    ctx.putImageData(out, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [ready]);
}

/** Axe des pôles : fin trait traversant le globe, dépassant aux deux extrémités. */
function PoleAxis({ hologram }: { hologram: boolean }) {
  return (
    <mesh>
      <cylinderGeometry args={[0.0022, 0.0022, GLOBE_RADIUS * 2.35, 12]} />
      <meshBasicMaterial
        color={hologram ? "#6ee0ff" : "#e8eef2"}
        transparent
        opacity={0.55}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Globe() {
  const renderMode = useSimulationStore((s) => s.renderMode);
  const hologram = renderMode === "hologram";
  const contourTex = useContourTexture();

  const colorMap = useTexture(colorUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const holoMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HOLO_VERTEX,
        fragmentShader: HOLO_FRAGMENT,
        uniforms: {
          uBase: { value: new THREE.Color(0.012, 0.045, 0.085) },
          uRim: { value: new THREE.Color(0.25, 1.05, 1.35) },
        },
        transparent: true,
      }),
    [],
  );

  return (
    <group>
      {hologram ? (
        <>
          <mesh material={holoMaterial}>
            <sphereGeometry args={[GLOBE_RADIUS, 96, 48]} />
          </mesh>
          {contourTex && (
            <mesh>
              <sphereGeometry args={[GLOBE_RADIUS * 1.0015, 96, 48]} />
              <meshBasicMaterial map={contourTex} transparent toneMapped={false} depthWrite={false} />
            </mesh>
          )}
        </>
      ) : (
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 96, 48]} />
          <meshStandardMaterial map={colorMap} roughness={1} metalness={0} />
        </mesh>
      )}
      <PoleAxis hologram={hologram} />
    </group>
  );
}
