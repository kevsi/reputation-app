import { useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { ScheduledReportItem } from "@/components/reports/ScheduledReportItem";
import { Plus } from "lucide-react";

const reportsData = [
  {
    id: "1",
    title: "Rapport mensuel - Décembre 2024",
    type: "Mensuel",
    date: "01 Déc 2024",
    status: "Terminé" as const,
    mentions: 7265,
    sentiment: "78%",
    engagement: 4523
  },
  {
    id: "2",
    title: "Analyse trimestrielle Q4 2024",
    type: "Trimestriel",
    date: "01 Oct 2024",
    status: "Terminé" as const,
    mentions: 21450,
    sentiment: "76%",
    engagement: 13240
  },
  {
    id: "3",
    title: "Rapport hebdomadaire - Semaine 50",
    type: "Hebdomadaire",
    date: "16 Déc 2024",
    status: "En cours" as const,
    mentions: 1834,
    sentiment: "82%",
    engagement: 1205
  }
];

const scheduledReportsData = [
  {
    id: "s1",
    title: "Rapport quotidien",
    schedule: "Tous les jours à 9h00",
    isActive: true
  },
  {
    id: "s2",
    title: "Résumé hebdomadaire",
    schedule: "Tous les lundis à 10h00",
    isActive: true
  },
  {
    id: "s3",
    title: "Analyse mensuelle",
    schedule: "Le 1er de chaque mois",
    isActive: true
  },
  {
    id: "s4",
    title: "Rapport concurrent",
    schedule: "Tous les mercredis",
    isActive: false
  }
];

export default function ReportsPage() {
  const [scheduledReports, setScheduledReports] = useState(scheduledReportsData);

  const handleToggleReport = (id: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Repports
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Générez et consultez vos rapports d'analyse
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Nouveau rapport
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Rapports générés</div>
            <div className="text-4xl font-bold text-foreground">48</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Ce mois-ci</div>
            <div className="text-4xl font-bold text-foreground">12</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Programmés</div>
            <div className="text-4xl font-bold text-foreground">4</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">En cours</div>
            <div className="text-4xl font-bold text-foreground">1</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <div className="xl:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Rapports récents
            </h2>
            <div className="space-y-4">
              {reportsData.map((report) => (
                <ReportCard
                  key={report.id}
                  {...report}
                  onPreview={() => console.log("Preview", report.id)}
                  onDownload={() => console.log("Download", report.id)}
                  onEdit={() => console.log("Edit", report.id)}
                  onDelete={() => console.log("Delete", report.id)}
                />
              ))}
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Rapports programmés
                </h2>
                <button className="text-sm text-primary hover:underline">
                  + Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {scheduledReports.map((report) => (
                  <ScheduledReportItem
                    key={report.id}
                    {...report}
                    onToggle={handleToggleReport}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}