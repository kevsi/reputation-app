import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrganisationTableRowProps {
  name: string;
  createdDate: string;
  plan: string;
  users: number;
  brands: number;
  status: "Actif" | "Suspendu" | "Inactif";
  onViewDetails: () => void;
}

export function OrganisationTableRow({
  name,
  createdDate,
  plan,
  users,
  brands,
  status,
  onViewDetails
}: OrganisationTableRowProps) {
  const getPlanStyle = () => {
    switch (plan.toUpperCase()) {
      case "ENTERPRISE":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100 border-none";
      case "PROFESSIONAL":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none";
      case "STARTER":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-none";
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case "Actif":
        return "bg-green-50 text-green-700 border-green-200";
      case "Suspendu":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      {/* Organisation */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{name}</span>
          <span className="text-[10px] text-muted-foreground">Créée le {createdDate}</span>
        </div>
      </td>

      {/* Plan */}
      <td className="px-6 py-4">
        <Badge className={`font-bold text-[10px] uppercase tracking-wider ${getPlanStyle()}`}>
          {plan}
        </Badge>
      </td>

      {/* Utilisateurs */}
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-medium text-foreground">{users}</span>
      </td>

      {/* Marques */}
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-medium text-foreground">{brands}</span>
      </td>

      {/* Statut */}
      <td className="px-6 py-4">
        <Badge variant="outline" className={`font-medium text-[11px] ${getStatusStyle()}`}>
          {status}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary"
        >
          Gérer
        </Button>
      </td>
    </tr>
  );
}

export default OrganisationTableRow;