import { useState } from "react";
import {
  Dices,
  Gauge,
  Globe,
  Grid3x3,
  Orbit,
  Pause,
  Percent,
  Play,
  RotateCw,
  SlidersHorizontal,
  StepForward,
  Trash2,
  X,
} from "lucide-react";
import { GRID_WIDTHS, useSimulationStore } from "../store/simulationStore";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 text-[10px] uppercase tracking-[0.22em] text-slate-500 first:mt-0">
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? "bg-cyan-400/80" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-950 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const buttonBase =
  "flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-200 transition-colors hover:border-cyan-300/40 hover:text-cyan-200";

export function SettingsPanel() {
  const [open, setOpen] = useState(true);
  const ready = useSimulationStore((s) => s.ready);
  const running = useSimulationStore((s) => s.running);
  const speed = useSimulationStore((s) => s.speed);
  const density = useSimulationStore((s) => s.density);
  const gridWidth = useSimulationStore((s) => s.gridWidth);
  const autoRotate = useSimulationStore((s) => s.autoRotate);
  const renderMode = useSimulationStore((s) => s.renderMode);
  const {
    setRunning,
    stepOnce,
    setSpeed,
    setDensity,
    setGridWidth,
    randomize,
    clearAll,
    setAutoRotate,
    setRenderMode,
  } = useSimulationStore();

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Ouvrir les réglages"
        onClick={() => setOpen(true)}
        className="absolute right-6 top-6 rounded-md border border-white/10 bg-slate-950/50 p-2.5 text-slate-300 backdrop-blur transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
      >
        <SlidersHorizontal size={16} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div className="absolute right-6 top-6 w-72 rounded-lg border border-white/10 bg-slate-950/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Réglages</div>
        <button
          type="button"
          aria-label="Fermer les réglages"
          onClick={() => setOpen(false)}
          className="text-slate-500 transition-colors hover:text-slate-200"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <SectionLabel>Simulation</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!ready} onClick={() => setRunning(!running)} className={buttonBase}>
          {running ? <Pause size={13} strokeWidth={1.5} /> : <Play size={13} strokeWidth={1.5} />}
          {running ? "Pause" : "Lecture"}
        </button>
        <button type="button" disabled={!ready} onClick={stepOnce} className={buttonBase}>
          <StepForward size={13} strokeWidth={1.5} />
          Pas à pas
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-300">
        <Gauge size={13} strokeWidth={1.5} className="shrink-0 text-slate-500" />
        <span className="w-14">Vitesse</span>
        <input
          type="range"
          min={1}
          max={60}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-10 text-right tabular-nums text-slate-400">{speed}/s</span>
      </div>

      <SectionLabel>Peuplement</SectionLabel>
      <div className="flex items-center gap-2.5 text-xs text-slate-300">
        <Percent size={13} strokeWidth={1.5} className="shrink-0 text-slate-500" />
        <span className="w-14">Densité</span>
        <input
          type="range"
          min={2}
          max={40}
          value={Math.round(density * 100)}
          onChange={(e) => setDensity(Number(e.target.value) / 100)}
          className="flex-1"
        />
        <span className="w-10 text-right tabular-nums text-slate-400">
          {Math.round(density * 100)} %
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" disabled={!ready} onClick={randomize} className={buttonBase}>
          <Dices size={13} strokeWidth={1.5} />
          Aléatoire
        </button>
        <button type="button" disabled={!ready} onClick={clearAll} className={buttonBase}>
          <Trash2 size={13} strokeWidth={1.5} />
          Tout effacer
        </button>
      </div>

      <SectionLabel>Grille</SectionLabel>
      <div className="flex items-center gap-2.5">
        <Grid3x3 size={13} strokeWidth={1.5} className="shrink-0 text-slate-500" />
        <div className="flex flex-1 gap-1">
          {GRID_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              disabled={!ready}
              onClick={() => setGridWidth(w)}
              className={`flex-1 rounded px-0 py-1.5 text-[10px] tabular-nums transition-colors ${
                gridWidth === w
                  ? "bg-cyan-400/15 text-cyan-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 text-right text-[10px] tabular-nums text-slate-600">
        {gridWidth} × {gridWidth / 2} cellules
      </div>

      <SectionLabel>Globe</SectionLabel>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-2.5">
          <RotateCw size={13} strokeWidth={1.5} className="text-slate-500" />
          Rotation automatique
        </span>
        <Toggle checked={autoRotate} onChange={setAutoRotate} />
      </div>
      <div className="mt-3 flex gap-1 rounded-md border border-white/10 p-1">
        <button
          type="button"
          onClick={() => setRenderMode("hologram")}
          className={`flex flex-1 items-center justify-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
            renderMode === "hologram" ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Orbit size={13} strokeWidth={1.5} />
          Hologramme
        </button>
        <button
          type="button"
          onClick={() => setRenderMode("realistic")}
          className={`flex flex-1 items-center justify-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
            renderMode === "realistic" ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe size={13} strokeWidth={1.5} />
          Réaliste
        </button>
      </div>
    </div>
  );
}
