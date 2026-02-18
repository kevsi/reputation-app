import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Share2, MoreVertical, Layout, Trash2, Edit2 } from "lucide-react";
import { Action } from "@/services/actions.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActionDetailModalProps {
    action: Action | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ActionDetailModal({
    action,
    isOpen,
    onOpenChange,
    onEdit,
    onDelete,
}: ActionDetailModalProps) {
    if (!action) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{action.status}</Badge>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <DialogTitle>{action.title}</DialogTitle>
                    <DialogDescription className="pt-2">
                        {action.description || "Aucune description détaillée."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Échéance</div>
                            <div className="text-sm font-medium">{action.dueDate ? format(new Date(action.dueDate), "d MMMM yyyy", { locale: fr }) : "Non définie"}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Responsable</div>
                            <div className="text-sm font-medium">{action.assignedTo}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layout className="w-4 h-4" />
                    <span>Plateforme : <span className="font-semibold text-foreground">{action.platform}</span></span>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
