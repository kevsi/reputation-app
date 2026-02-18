import { Calendar } from "lucide-react";
import { useState } from "react";

interface PeriodSelectorProps {
  onPeriodChange?: (period: string) => void;
}

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30j");
  const [lastUpdate] = useState("Il y a 5 minutes");

  const periods = [
    { value: "7j", label: "7 derniers jours" },
    { value: "30j", label: "30 derniers jours" },
    { value: "90j", label: "90 derniers jours" },
    { value: "custom", label: "Période personnalisée" }
  ];

  const handleChange = (value: string) => {
    setSelectedPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedPeriod}
            onChange={(e) => handleChange(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="text-xs text-muted-foreground">
          Dernière mise à jour : <span className="font-medium">{lastUpdate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground">
          <option>Toutes les langues</option>
          <option>Français</option>
          <option>Anglais</option>
          <option>Espagnol</option>
        </select>
      </div>
    </div>
  );
}

export default PeriodSelector;