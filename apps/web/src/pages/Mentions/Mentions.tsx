import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MentionCard } from "@/components/mentions/MentionCard";
import { MentionDetailModal } from "@/components/mentions/MentionDetailModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Search, Download, Loader2, AlertCircle } from "lucide-react";
import { mentionsService } from "@/services/mentions.service";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { usePlan } from "@/hooks/usePlan";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MentionDetail } from "@/types/api";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Types
interface MappedMention {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  platform: string;
  url?: string;
  sentiment: {
    type: string;
    score: string;
  };
  tags: string[];
  actions: {
    treated?: boolean;
    ignored?: boolean;
    monitored?: boolean;
    alert?: boolean;
  };
  raw: MentionDetail;
}

const filters = [
  { label: "Tous", value: "all" },
  { label: "Positif", value: "POSITIVE" },
  { label: "Négatif", value: "NEGATIVE" },
  { label: "Neutre", value: "NEUTRAL" },
];

export default function MentionsPage() {
  const { brandId: urlBrandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { brands, selectedBrand, setSelectedBrand } = useBrand();
  const { plan, hasFeature } = usePlan();

  // State
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mentions, setMentions] = useState<MappedMention[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [selectedMention, setSelectedMention] = useState<MentionDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => { }
  });

  const pageSize = 20;

  const transformMention = useCallback((mention: MentionDetail): MappedMention => {
    const authorName = mention.author || 'Anonyme';
    return {
      id: mention.id,
      author: authorName,
      avatar: (authorName?.[0]?.toUpperCase() || 'A').substring(0, 2),
      timestamp: mention.publishedAt ? formatDistanceToNow(new Date(mention.publishedAt), { locale: fr, addSuffix: true }) : 'Date inconnue',
      content: mention.content,
      platform: mention.source?.type || 'Autres',
      url: mention.url,
      sentiment: {
        type: mention.sentiment,
        score: typeof mention.sentimentScore === 'number' ? `${Math.round(mention.sentimentScore * 100)}%` : '0%'
      },
      tags: mention.detectedKeywords || [],
      actions: {
        treated: mention.status === 'TREATED',
        ignored: mention.status === 'IGNORED',
        monitored: mention.status === 'MONITORED',
        alert: false
      },
      raw: mention
    };
  }, []);

  const fetchMentions = useCallback(async () => {
    const effectiveId = urlBrandId || selectedBrand?.id;
    if (!effectiveId) return;

    setLoading(true);
    try {
      const res = await mentionsService.getAll({
        brandId: effectiveId,
        page: currentPage,
        limit: pageSize,
        sentiment: activeFilter !== "all" ? (activeFilter as any) : undefined,
        searchTerm: searchQuery || undefined
      });

      if (!isApiError(res) && res.data) {
        setMentions(res.data.items.map(transformMention));
        setTotalItems(res.data.total);
        setTotalPages(res.data.totalPages || Math.ceil(res.data.total / pageSize));
      } else {
        setError(ApiErrorHandler.getUserMessage(isApiError(res) ? res.error : null));
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [urlBrandId, selectedBrand?.id, activeFilter, searchQuery, currentPage, transformMention]);

  useEffect(() => { fetchMentions(); }, [fetchMentions]);

  useBrandListener(async () => {
    if (selectedBrand && selectedBrand.id !== urlBrandId) {
      navigate(`/mentions/${selectedBrand.id}`);
    } else {
      setCurrentPage(1);
      await fetchMentions();
    }
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await mentionsService.updateStatus(id, status as any);
      if (!isApiError(res)) {
        toast.success(`Statut mis à jour : ${status.toLowerCase()}`);
        fetchMentions();
      } else {
        toast.error("Échec de la mise à jour");
      }
    } catch (e) {
      toast.error("Erreur serveur");
    }
  };

  const handleActionClick = (mentionId: string, status: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      description: `Voulez-vous marquer cette mention comme "${status.toLowerCase()}" ?`,
      action: () => updateStatus(mentionId, status)
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mentions</h1>
            <p className="text-muted-foreground mt-1">Gérez votre e-réputation en temps réel pour {selectedBrand?.name}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchMentions}>
              <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            {hasFeature('basic_reports') && (
              <Button size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Exporter CSV
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par auteur, plateforme ou contenu..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={activeFilter === f.value ? "default" : "secondary"}
                size="sm"
                onClick={() => { setActiveFilter(f.value); setCurrentPage(1); }}
                className="rounded-full px-5"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[500px]">
          {loading && !mentions.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyse des flux en cours...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center bg-destructive/5 rounded-3xl border border-destructive/20">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="font-bold text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchMentions}>Réessayer</Button>
            </div>
          ) : mentions.length === 0 ? (
            <div className="py-20 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Aucune mention trouvée pour ces critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mentions.map((m) => (
                <MentionCard
                  key={m.id}
                  {...m}
                  onClick={() => { setSelectedMention(m.raw); setIsDetailOpen(true); }}
                  onTreated={() => handleActionClick(m.id, 'TREATED', 'Traiter la mention')}
                  onIgnored={() => handleActionClick(m.id, 'IGNORED', 'Ignorer la mention')}
                  onMonitored={() => handleActionClick(m.id, 'MONITORED', 'Surveiller la mention')}
                  onAlert={() => toast.info("Fonctionnalité d'alerte à venir")}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Page {currentPage} sur {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Précédent</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MentionDetailModal
        mention={selectedMention}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.action}
        confirmLabel="Confirmer"
        variant="default"
      />
    </div>
  );
}
