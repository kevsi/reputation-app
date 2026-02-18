"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QualityPage;
const QualityMetricCard_1 = require("@/components/quality/QualityMetricCard");
const lucide_react_1 = require("lucide-react");
const qualityMetrics = [
    {
        title: "Complétude des données",
        value: 96,
        unit: "%",
        trend: "+2.3%",
        isPositiveTrend: true,
        threshold: 90,
        icon: "📊"
    },
    {
        title: "Précision du sentiment",
        value: 94,
        unit: "%",
        trend: "+1.5%",
        isPositiveTrend: true,
        threshold: 85,
        icon: "🎯"
    },
    {
        title: "Taux de doublons",
        value: 2,
        unit: "%",
        trend: "-0.8%",
        isPositiveTrend: true,
        threshold: 5,
        icon: "🔄"
    },
    {
        title: "Données manquantes",
        value: 4,
        unit: "%",
        trend: "-1.2%",
        isPositiveTrend: true,
        threshold: 10,
        icon: "❓"
    }
];
const issuesData = [
    {
        id: 1,
        type: "Doublons",
        count: 234,
        source: "Twitter",
        severity: "Faible"
    },
    {
        id: 2,
        type: "Métadonnées manquantes",
        count: 89,
        source: "Instagram",
        severity: "Moyenne"
    },
    {
        id: 3,
        type: "Sentiment non classifié",
        count: 45,
        source: "Reddit",
        severity: "Élevée"
    }
];
function QualityPage() {
    const totalIssues = issuesData.reduce((sum, i) => sum + i.count, 0);
    const avgQuality = Math.round(qualityMetrics.reduce((sum, m) => sum + m.value, 0) / qualityMetrics.length);
    return (<div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <lucide_react_1.CheckCircle className="w-7 h-7"/>
          Qualité des données
        </h1>
        <p className="text-sm text-muted-foreground">
          Surveillance et amélioration de la qualité
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-900 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Score de qualité global
            </div>
            <div className="text-6xl font-bold text-green-600">
              {avgQuality}%
            </div>
            <div className="text-sm text-green-600 mt-2">
              ✓ Excellent niveau de qualité
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-2">
              Problèmes détectés
            </div>
            <div className="text-4xl font-bold text-foreground">
              {totalIssues}
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              Résoudre automatiquement
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {qualityMetrics.map((metric, index) => (<QualityMetricCard_1.QualityMetricCard key={index} {...metric}/>))}
      </div>

      {/* Issues Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Problèmes détectés
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Occurrences
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sévérité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {issuesData.map((issue) => (<tr key={issue.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-foreground">
                      {issue.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-foreground">{issue.count}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">{issue.source}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${issue.severity === "Élevée" ? "bg-red-100 text-red-700" :
                issue.severity === "Moyenne" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground">
                      Corriger
                    </button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-3">
        <lucide_react_1.AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
        <div className="text-sm text-foreground">
          <span className="font-semibold">Vérifications automatiques :</span> La qualité des données est analysée en continu. 
          Les corrections automatiques sont appliquées toutes les heures pour les problèmes de faible et moyenne sévérité.
        </div>
      </div>
    </div>);
}
