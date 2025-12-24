interface OrganisationTableRowProps {
  name: string;
  createdDate: string;
  plan: "Enterprise" | "Professional" | "Starter";
  users: number;
  mentions: number;
  iaUsage: string;
  status: "Actif" | "Suspendu" | "Inactif";
  onViewDetails: () => void;
}

export function OrganisationTableRow({
  name,
  createdDate,
  plan,
  users,
  mentions,
  iaUsage,
  status,
  onViewDetails
}: OrganisationTableRowProps) {
  const getPlanStyle = () => {
    switch (plan) {
      case "Enterprise":
        return "bg-purple-100 text-purple-700";
      case "Professional":
        return "bg-blue-100 text-blue-700";
      case "Starter":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-700";
      case "Suspendu":
        return "bg-orange-100 text-orange-700";
      case "Inactif":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Organisation */}
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-sm text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">Créée le {createdDate}</div>
        </div>
      </td>

      {/* Plan */}
      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getPlanStyle()}`}>
          {plan}
        </span>
      </td>

      {/* Utilisateurs */}
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{users}</span>
      </td>

      {/* Mentions */}
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{mentions.toLocaleString()}</span>
      </td>

      {/* IA Usage */}
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{iaUsage}</span>
      </td>

      {/* Statut */}
      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <button
          onClick={onViewDetails}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground"
        >
          Voir détails
        </button>
      </td>
    </tr>
  );
}

export default OrganisationTableRow;