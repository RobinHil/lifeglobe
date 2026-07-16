import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore, getEngine } from "../store/simulationStore";
import type { LifeEngine } from "../simulation/lifeEngine";
import { GLOBE_RADIUS } from "./Globe";

// Léger dépassement pour que deux cellules voisines soient parfaitement jointives
// (aucune séparation visible : elles forment une seule forme continue).
const OVERLAP = 1.12;
// Cellules posées à ras de la surface, juste au-dessus pour éviter le z-fighting.
const CELL_RADIUS = GLOBE_RADIUS * 1.0035;

const dummy = new THREE.Object3D();
const lookTarget = new THREE.Vector3();

/**
 * Matrice d'une cellule : petit carré tangent à la sphère, à lat/lon de la grille.
 * La forme est la même partout (toujours un carré), à taille pleine - donc jointive -
 * jusqu'à ~70° de latitude. Au-delà, où les colonnes de la grille convergent vers le
 * pôle, la taille suit l'espacement pour éviter un amas lumineux au point de convergence.
 */
function writeCellMatrix(
  mesh: THREE.InstancedMesh,
  idx: number,
  cell: number,
  w: number,
  h: number,
  radius: number,
  size: number,
) {
  const x = cell % w;
  const y = (cell - x) / w;
  const polar = (Math.PI * (y + 0.5)) / h;
  const sinP = Math.sin(polar);
  const cosP = Math.cos(polar);
  const lon = -Math.PI + ((Math.PI * 2) / w) * (x + 0.5);
  const px = radius * sinP * Math.cos(lon);
  const py = radius * cosP;
  const pz = -radius * sinP * Math.sin(lon);

  dummy.position.set(px, py, pz);
  const nearPole = Math.abs(cosP) > 0.995;
  dummy.up.set(nearPole ? 1 : 0, nearPole ? 0 : 1, 0);
  lookTarget.set(px * 2, py * 2, pz * 2);
  dummy.lookAt(lookTarget);
  const s = size * Math.min(1, Math.max(0.12, sinP / 0.35));
  dummy.scale.set(s, s, 1);
  dummy.updateMatrix();
  mesh.setMatrixAt(idx, dummy.matrix);
}

function cellSize(engine: LifeEngine, radius: number) {
  return ((Math.PI / engine.height) * radius) * OVERLAP;
}

/** Seules les cellules vivantes sont rendues, reconstruites à chaque tick. */
export function LifeGrid() {
  const simVersion = useSimulationStore((s) => s.simVersion);
  const [capacity, setCapacity] = useState(32768);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const accumulator = useRef(0);

  // Boucle de simulation, découplée du framerate : `speed` générations/seconde.
  // Aux hautes résolutions, on plafonne les pas par frame pour rester fluide.
  useFrame((_, delta) => {
    const st = useSimulationStore.getState();
    if (!st.ready || !st.running) {
      accumulator.current = 0;
      return;
    }
    accumulator.current += Math.min(delta, 0.25) * st.speed;
    const maxSteps = st.gridWidth >= 2880 ? 1 : st.gridWidth >= 1440 ? 2 : 4;
    const steps = Math.min(Math.floor(accumulator.current), maxSteps);
    if (steps > 0) {
      accumulator.current -= Math.floor(accumulator.current);
      for (let i = 0; i < steps; i++) st.tick();
    }
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        // Valeurs > 1 : seul le bloom les attrape (léger glow des cellules vivantes).
        color: new THREE.Color(0.35, 1.55, 1.85),
        toneMapped: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const engine = getEngine();
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!engine) {
      mesh.count = 0;
      return;
    }

    if (engine.population > capacity) {
      setCapacity(Math.ceil(engine.population * 1.6));
      return;
    }

    const { width: w, height: h, cells } = engine;
    const size = cellSize(engine, CELL_RADIUS);
    let idx = 0;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i]) writeCellMatrix(mesh, idx++, i, w, h, CELL_RADIUS, size);
    }
    mesh.count = idx;
    mesh.instanceMatrix.needsUpdate = true;
  }, [simVersion, capacity]);

  return (
    <instancedMesh
      key={capacity}
      ref={meshRef}
      args={[geometry, material, capacity]}
      frustumCulled={false}
    />
  );
}
