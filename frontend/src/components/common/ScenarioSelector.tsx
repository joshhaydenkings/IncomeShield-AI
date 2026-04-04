import {
  CloudRain,
  Waves,
  Wind,
  ServerCrash,
  MapPinned,
  CheckCircle2,
} from "lucide-react";
import { useScenarioOptions } from "../../hooks/useScenarioOptions";
import type { ScenarioKey } from "../../services/mockData";

type ScenarioSelectorProps = {
  value: ScenarioKey;
  onChange: (scenario: ScenarioKey) => void;
};

const iconMap: Record<ScenarioKey, React.ReactNode> = {
  normal: <CheckCircle2 className="h-5 w-5" />,
  rain: <CloudRain className="h-5 w-5" />,
  flood: <Waves className="h-5 w-5" />,
  aqi: <Wind className="h-5 w-5" />,
  outage: <ServerCrash className="h-5 w-5" />,
  gps_spoof: <MapPinned className="h-5 w-5" />,
};

function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  const { options, loading } = useScenarioOptions();

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-sm text-slate-500">
          Loading scenarios...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`rounded-2xl border px-4 py-4 text-left font-medium transition ${
            value === item.key
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {iconMap[item.key]}
            <span>{item.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ScenarioSelector;