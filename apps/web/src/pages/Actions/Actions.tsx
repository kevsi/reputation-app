import { useState, useEffect, useCallback } from "react";
import { ActionItemCard } from "@/components/actions/ActionItemCard";
import { ActionFormModal } from "@/components/actions/ActionFormModal";
import { ActionDetailModal } from "@/components/actions/ActionDetailModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { actionsService, Action } from "@/services/actions.service";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ActionsData {
  pending: Action[];
  inProgress: Action[];
  completed: Action[];
}

export default function ActionsPage() {
  const { selectedBrand } = useBrand();

  // State
  const [actions, setActions] = useState<ActionsData>({ pending: [], inProgress: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [formModal, setFormModal] = useState<{ isOpen: boolean; data: Action | null }>({
    isOpen: false,
    data: null
  });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; data: Action | null }>({
    isOpen: false,
    data: null
  });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const fetchActions = useCallback(async () => {
    if (!selectedBrand) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await actionsService.getAll(selectedBrand.id);

      if (!isApiError(response) && response.data) {
        const all = response.data;
        setActions({
          pending: all.filter(a => a.status === 'pending'),
          inProgress: all.filter(a => a.status === 'in-progress'),
          completed: all.filter(a => a.status === 'completed')
        });
      } else {
        setError(ApiErrorHandler.getUserMessage(response.error!));
      }
    } catch (err) {
      setError("Impossible de charger les actions");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => { fetchActions(); }, [fetchActions]);
  useBrandListener(async () => { await fetchActions(); });

  const handleUpdateStatus = async (id: string, newStatus: Action['status']) => {
    try {
      const response = await actionsService.updateStatus(id, newStatus);
      if (isApiError(response)) {
        toast.error("Échec de la mise à jour");
      } else {
        toast.success(`Action passée en ${newStatus}`);
        await fetchActions();
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  const handleSubmitAction = async (data: Partial<Action>) => {
    if (!selectedBrand) return;
    try {
      let res;
      if (formModal.data) {
        res = await actionsService.update(formModal.data.id, data);
      } else {
        res = await actionsService.create({ ...data, brandId: selectedBrand.id } as any);
      }

      if (!isApiError(res)) {
        toast.success(formModal.data ? "Action mise à jour" : "Nouvelle action créée");
        await fetchActions();
      } else {
        toast.error(ApiErrorHandler.getUserMessage(res.error));
      }
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      const res = await actionsService.delete(id);
      if (!isApiError(res)) {
        toast.success("Action supprimée");
        await fetchActions();
      } else {
        toast.error("Erreur suppression");
      }
    } catch (e) {
      toast.error("Erreur technique");
    }
  };


  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1700px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Actions</h1>
            <p className="text-muted-foreground mt-1">Gérez vos tâches et plans d'action pour {selectedBrand?.name}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchActions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            <Button size="sm" onClick={() => setFormModal({ isOpen: true, data: null })} className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle action
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Column Pending */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" /> À traiter
              </h2>
              <Badge className="bg-muted text-muted-foreground">{actions.pending.length}</Badge>
            </div>
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl min-h-[500px] border border-dashed">
              {actions.pending.map(a => (
                <ActionItemCard
                  key={a.id}
                  {...a}
                  onViewDetails={() => setDetailModal({ isOpen: true, data: a })}
                  onStart={() => handleUpdateStatus(a.id, 'in-progress')}
                />
              ))}
              {actions.pending.length === 0 && <p className="text-center py-20 text-muted-foreground text-sm italic">Aucune tâche en attente</p>}
            </div>
          </div>

          {/* Column In Progress */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> En cours
              </h2>
              <Badge className="bg-muted text-muted-foreground">{actions.inProgress.length}</Badge>
            </div>
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl min-h-[500px] border border-dashed">
              {actions.inProgress.map(a => (
                <ActionItemCard
                  key={a.id}
                  {...a}
                  onViewDetails={() => setDetailModal({ isOpen: true, data: a })}
                  onComplete={() => handleUpdateStatus(a.id, 'completed')}
                />
              ))}
              {actions.inProgress.length === 0 && <p className="text-center py-20 text-muted-foreground text-sm italic">Pas d'action en cours</p>}
            </div>
          </div>

          {/* Column Completed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Terminées
              </h2>
              <Badge className="bg-muted text-muted-foreground">{actions.completed.length}</Badge>
            </div>
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl min-h-[500px] border border-dashed">
              {actions.completed.map(a => (
                <ActionItemCard
                  key={a.id}
                  {...a}
                  onViewDetails={() => setDetailModal({ isOpen: true, data: a })}
                />
              ))}
              {actions.completed.length === 0 && <p className="text-center py-20 text-muted-foreground text-sm italic">Rien à afficher</p>}
            </div>
          </div>
        </div>
      </div>

      <ActionFormModal
        isOpen={formModal.isOpen}
        onOpenChange={(v) => setFormModal(prev => ({ ...prev, isOpen: v }))}
        onSubmit={handleSubmitAction}
        initialData={formModal.data}
      />

      <ActionDetailModal
        action={detailModal.data}
        isOpen={detailModal.isOpen}
        onOpenChange={(v) => setDetailModal(prev => ({ ...prev, isOpen: v }))}
        onEdit={() => {
          setFormModal({ isOpen: true, data: detailModal.data });
          setDetailModal({ isOpen: false, data: null });
        }}
        onDelete={() => {
          if (detailModal.data) setConfirmDelete({ isOpen: true, id: detailModal.data.id });
        }}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(v) => setConfirmDelete(prev => ({ ...prev, isOpen: v }))}
        title="Supprimer la tâche"
        description="Cette action est irréversible. Toutes les données liées à cette action seront perdues."
        onConfirm={async () => {
          if (confirmDelete.id) {
            await handleDeleteAction(confirmDelete.id);
            setDetailModal({ isOpen: false, data: null });
          }
        }}
      />
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}