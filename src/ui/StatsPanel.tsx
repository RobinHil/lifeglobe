import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useSimulationStore } from "../store/simulationStore";

const fmt = new Intl.NumberFormat("fr-FR");

/**
 * Petit graphique discret de l'évolution de la population.
 * Il se rafraîchit à son propre rythme (2,5 fois/s), indépendamment des ticks.
 * Échelle verticale adaptative (min-max de l'historique) pour rendre les
 * variations bien visibles, avec les bornes affichées en repère.
 */
export function StatsPanel() {
  const [data, setData] = useState<{ p: number }[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setData(useSimulationStore.getState().history.map((p) => ({ p })));
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  if (data.length < 2) return null;

  let min = Infinity;
  let max = -Infinity;
  for (const { p } of data) {
    if (p < min) min = p;
    if (p > max) max = p;
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }

  return (
    <div className="pointer-events-none absolute bottom-8 left-8 select-none">
      <div className="flex items-stretch gap-2">
        <div className="h-14 w-64 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#53d9ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#53d9ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[min, max]} />
              <Area
                type="monotone"
                dataKey="p"
                stroke="#53d9ff"
                strokeWidth={1.2}
                fill="url(#pop)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-between py-0.5 text-[9px] tabular-nums text-slate-500">
          <span>{fmt.format(max)}</span>
          <span>{fmt.format(min)}</span>
        </div>
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-600">
        Évolution de la population
      </div>
    </div>
  );
}
