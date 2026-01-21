import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserTableRowProps {
  name: string;
  email: string;
  organisationId: string;
  organisationName?: string;
  role: string;
  createdAt: string;
  status: "Actif" | "Bloqué";
  onManage: () => void;
}

export function UserTableRow({
  name,
  email,
  organisationName,
  role,
  createdAt,
  status,
  onManage
}: UserTableRowProps) {
  const getRoleStyle = () => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100 border-none";
      case "MANAGER":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-none";
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case "Actif":
        return "bg-green-50 text-green-700 border-green-200";
      case "Bloqué":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      {/* Utilisateur */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{name}</span>
          <span className="text-[10px] text-muted-foreground">{email}</span>
        </div>
      </td>

      {/* Organisation */}
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-foreground">{organisationName || 'N/A'}</span>
      </td>

      {/* Rôle */}
      <td className="px-6 py-4">
        <Badge className={`font-bold text-[10px] uppercase tracking-wider ${getRoleStyle()}`}>
          {role}
        </Badge>
      </td>

      {/* Date d'inscription */}
      <td className="px-6 py-4">
        <span className="text-sm text-muted-foreground">{createdAt}</span>
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
          onClick={onManage}
          className="h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary"
        >
          Gérer
        </Button>
      </td>
    </tr>
  );
}

export default UserTableRow;