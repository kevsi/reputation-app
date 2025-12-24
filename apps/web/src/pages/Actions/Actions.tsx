import { useState } from "react";
import { ActionItemCard } from "@/components/actions/ActionItemCard";
import { Sparkles, Plus } from "lucide-react";

const actionsData = {
  pending: [
    {
      id: "1",
      title: "Répondre au tweet de @customer_123 concernant le produit X",
      platform: "Twitter",
      priority: "Priorité haute" as const,
      assignedTo: "Marie Dupont",
      dueDate: "Aujourd'hui, 14h00",
      status: "pending" as const
    },
    {
      id: "2",
      title: "Interagir avec le post d'un influenceur mentionnant notre marque",
      platform: "LinkedIn",
      priority: "Moyenne" as const,
      assignedTo: "Sophie Laurent",
      dueDate: "Demain, 10h00",
      status: "pending" as const
    },
    {
      id: "3",
      title: "Publier une réponse au commentaire négatif sur Facebook",
      platform: "Facebook",
      priority: "Priorité haute" as const,
      assignedTo: "Thomas Martin",
      dueDate: "Aujourd'hui, 16h00",
      status: "pending" as const
    }
  ],
  inProgress: [
    {
      id: "4",
      title: "Escalader la plainte concernant la livraison retardée",
      platform: "Instagram",
      priority: "Urgent" as const,
      assignedTo: "Jean Martin",
      dueDate: "Aujourd'hui, 11h00",
      status: "in-progress" as const
    }
  ],
  completed: [
    {
      id: "5",
      title: "Remercier @tech_reviewer pour son avis positif",
      platform: "Twitter",
      priority: "Moyenne" as const,
      assignedTo: "Marie Dupont",
      dueDate: "Hier, 15h00",
      status: "completed" as const
    }
  ]
};

export default function ActionsPage() {
  const [actions, setActions] = useState(actionsData);

  const handleStart = (id: string) => {
    console.log("Start action:", id);
    // Logic to move action to in-progress
  };

  const handleComplete = (id: string) => {
    console.log("Complete action:", id);
    // Logic to move action to completed
  };

  const totalPending = actions.pending.length;
  const totalInProgress = actions.inProgress.length;
  const totalCompleted = actions.completed.length;
  const totalActions = totalPending + totalInProgress + totalCompleted;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Actions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos tâches et actions à effectuer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Sparkles className="w-4 h-4" />
                Suggestions IA
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nouvelle action
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">En attente</div>
            <div className="text-4xl font-bold text-foreground">{totalPending}</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">En cours</div>
            <div className="text-4xl font-bold text-foreground">{totalInProgress}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Terminées</div>
            <div className="text-4xl font-bold text-foreground">{totalCompleted}</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Total</div>
            <div className="text-4xl font-bold text-foreground">{totalActions}</div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* En attente */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              En attente ({totalPending})
            </h2>
            <div className="flex flex-col gap-4">
              {actions.pending.map((action) => (
                <ActionItemCard
                  key={action.id}
                  {...action}
                  onViewDetails={() => console.log("View", action.id)}
                  onStart={() => handleStart(action.id)}
                />
              ))}
            </div>
          </div>

          {/* En cours */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              En cours ({totalInProgress})
            </h2>
            <div className="flex flex-col gap-4">
              {actions.inProgress.map((action) => (
                <ActionItemCard
                  key={action.id}
                  {...action}
                  onViewDetails={() => console.log("View", action.id)}
                  onComplete={() => handleComplete(action.id)}
                />
              ))}
            </div>
          </div>

          {/* Terminées */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Terminées ({totalCompleted})
            </h2>
            <div className="flex flex-col gap-4">
              {actions.completed.map((action) => (
                <ActionItemCard
                  key={action.id}
                  {...action}
                  onViewDetails={() => console.log("View", action.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}