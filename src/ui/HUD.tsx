import { useSimulationStore } from "../store/simulationStore";

const fmt = new Intl.NumberFormat("fr-FR");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-0.5 font-light tabular-nums text-slate-100">{value}</div>
    </div>
  );
}

export function HUD() {
  const generation = useSimulationStore((s) => s.generation);
  const population = useSimulationStore((s) => s.population);
  const births = useSimulationStore((s) => s.births);
  const deaths = useSimulationStore((s) => s.deaths);

  return (
    <div className="pointer-events-none absolute left-8 top-8 select-none">
      <div className="text-sm font-light uppercase tracking-[0.45em] text-cyan-200/90">
        LifeGlobe
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">
        Jeu de la vie de Conway
      </div>
      <div className="mt-8 space-y-5 text-xl">
        <Stat label="Population" value={fmt.format(population)} />
        <Stat label="Génération" value={fmt.format(generation)} />
        <div className="flex gap-8 text-base">
          <Stat label="Naissances" value={fmt.format(births)} />
          <Stat label="Morts" value={fmt.format(deaths)} />
        </div>
      </div>
    </div>
  );
}
