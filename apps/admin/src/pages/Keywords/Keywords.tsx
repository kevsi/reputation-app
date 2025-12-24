import { useState } from "react";
import { KeywordTableRow } from "@/components/keywords/KeywordTableRow";
import { Plus } from "lucide-react";

const keywordsData = [
  {
    id: 1,
    keyword: "@*",
    type: "mention" as const,
    priority: "high" as const,
    organisations: 45,
    isActive: true
  },
  {
    id: 2,
    keyword: "#trending",
    type: "hashtag" as const,
    priority: "medium" as const,
    organisations: 23,
    isActive: true
  },
  {
    id: 3,
    keyword: "crisis|scandal",
    type: "regex" as const,
    priority: "urgent" as const,
    organisations: 67,
    isActive: true
  },
  {
    id: 4,
    keyword: "spam keywords",
    type: "exclusion" as const,
    priority: "low" as const,
    organisations: 89,
    isActive: false
  }
];

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState(keywordsData);

  const handleToggle = (id: number) => {
    setKeywords(prev =>
      prev.map(kw =>
        kw.id === id ? { ...kw, isActive: !kw.isActive } : kw
      )
    );
  };

  const activeCount = keywords.filter(k => k.isActive).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🔑 Mots-clés & règles de collecte
            </h1>
            <p className="text-sm text-muted-foreground">
              Contrôler ce qui est collecté
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nouvelle règle
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Règles totales
          </div>
          <div className="text-3xl font-bold text-foreground">
            {keywords.length}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Règles actives
          </div>
          <div className="text-3xl font-bold text-foreground">
            {activeCount}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Organisations couvertes
          </div>
          <div className="text-3xl font-bold text-foreground">
            {Math.max(...keywords.map(k => k.organisations))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mot-clé / Règle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Organisations
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword) => (
                <KeywordTableRow
                  key={keyword.id}
                  keyword={keyword.keyword}
                  type={keyword.type}
                  priority={keyword.priority}
                  organisations={keyword.organisations}
                  isActive={keyword.isActive}
                  onToggle={() => handleToggle(keyword.id)}
                  onModify={() => console.log("Modify", keyword.id)}
                  onTest={() => console.log("Test", keyword.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
        <div className="text-sm text-foreground">
          💡 <span className="font-semibold">Astuce :</span> Les règles de type "regex" permettent des recherches avancées. 
          Utilisez "|" pour combiner plusieurs termes (ex: "crise|problème|bug").
        </div>
      </div>
    </div>
  );
}