import { create } from "zustand";
import { LifeEngine } from "../simulation/lifeEngine";
import { buildLandMask, loadTerrainSource, type TerrainSource } from "../simulation/terrainMask";
import maskUrl from "../assets/earth-water-mask.png";

export type RenderMode = "hologram" | "realistic";

export const GRID_WIDTHS = [360, 720, 1440, 2880] as const;
export const DEFAULT_GRID_WIDTH = 720;
const HISTORY_LENGTH = 600;

// L'engine et la source terrain vivent hors du store (gros tableaux mutables,
// inutiles à rendre réactifs).
let engine: LifeEngine | null = null;
let terrain: TerrainSource | null = null;
let initPromise: Promise<void> | null = null;

export function getEngine(): LifeEngine | null {
  return engine;
}

export function getTerrain(): TerrainSource | null {
  return terrain;
}

interface SimulationState {
  ready: boolean;
  running: boolean;
  speed: number; // générations par seconde
  gridWidth: number;
  density: number;
  renderMode: RenderMode;
  autoRotate: boolean;

  generation: number;
  population: number;
  births: number;
  deaths: number;
  history: number[];
  /** Incrémenté à chaque changement d'état des cellules (tick, reset, clear). */
  simVersion: number;

  init: () => Promise<void>;
  tick: () => void;
  setRunning: (running: boolean) => void;
  stepOnce: () => void;
  setSpeed: (speed: number) => void;
  setDensity: (density: number) => void;
  setGridWidth: (width: number) => void;
  randomize: () => void;
  clearAll: () => void;
  setRenderMode: (mode: RenderMode) => void;
  setAutoRotate: (autoRotate: boolean) => void;
}

function statsOf(e: LifeEngine) {
  return {
    generation: e.generation,
    population: e.population,
    births: e.births,
    deaths: e.deaths,
  };
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  ready: false,
  running: true,
  speed: 10,
  gridWidth: DEFAULT_GRID_WIDTH,
  density: 0.12,
  renderMode: "hologram",
  autoRotate: true,

  generation: 0,
  population: 0,
  births: 0,
  deaths: 0,
  history: [],
  simVersion: 0,

  init: () => {
    initPromise ??= (async () => {
      terrain = await loadTerrainSource(maskUrl);
      const { gridWidth, density } = get();
      const gridHeight = gridWidth / 2;
      engine = new LifeEngine(gridWidth, gridHeight, buildLandMask(terrain, gridWidth, gridHeight));
      engine.randomize(density);
      set((s) => ({
        ready: true,
        ...statsOf(engine!),
        history: [engine!.population],
        simVersion: s.simVersion + 1,
      }));
    })();
    return initPromise;
  },

  tick: () => {
    if (!engine) return;
    engine.step();
    set((s) => ({
      ...statsOf(engine!),
      history: [...s.history.slice(-(HISTORY_LENGTH - 1)), engine!.population],
      simVersion: s.simVersion + 1,
    }));
  },

  setRunning: (running) => set({ running }),

  stepOnce: () => {
    set({ running: false });
    get().tick();
  },

  setSpeed: (speed) => set({ speed }),
  setDensity: (density) => set({ density }),

  setGridWidth: (width) => {
    if (!terrain) return;
    const gridHeight = width / 2;
    engine = new LifeEngine(width, gridHeight, buildLandMask(terrain, width, gridHeight));
    engine.randomize(get().density);
    set((s) => ({
      gridWidth: width,
      ...statsOf(engine!),
      history: [engine!.population],
      simVersion: s.simVersion + 1,
    }));
  },

  randomize: () => {
    if (!engine) return;
    engine.randomize(get().density);
    set((s) => ({ ...statsOf(engine!), history: [engine!.population], simVersion: s.simVersion + 1 }));
  },

  clearAll: () => {
    if (!engine) return;
    engine.clear();
    set((s) => ({ running: false, ...statsOf(engine!), history: [], simVersion: s.simVersion + 1 }));
  },

  setRenderMode: (renderMode) => set({ renderMode }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
}));
