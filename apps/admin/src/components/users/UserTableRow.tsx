interface UserTableRowProps {
  name: string;
  email: string;
  organisation: string;
  role: "Admin" | "Manager" | "Analyst" | "Viewer";
  lastConnection: string;
  status: "Actif" | "Bloqué" | "Inactif";
  onManage: () => void;
}

export function UserTableRow({
  name,
  email,
  organisation,
  role,
  lastConnection,
  status,
  onManage
}: UserTableRowProps) {
  const getRoleStyle = () => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700";
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Analyst":
        return "bg-green-100 text-green-700";
      case "Viewer":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-700";
      case "Bloqué":
        return "bg-red-100 text-red-700";
      case "Inactif":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Utilisateur */}
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-sm text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{email}</div>
        </div>
      </td>

      {/* Organisation */}
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{organisation}</span>
      </td>

      {/* Rôle */}
      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getRoleStyle()}`}>
          {role}
        </span>
      </td>

      {/* Dernière connexion */}
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">{lastConnection}</span>
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
          onClick={onManage}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground"
        >
          Gérer
        </button>
      </td>
    </tr>
  );
}

export default UserTableRow;