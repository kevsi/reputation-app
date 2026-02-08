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
import { Clock, ShieldCheck, Activity } from "lucide-react";
import { AlertDetail } from "@/types/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AlertDetailModalProps {
    alert: AlertDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onResolve?: (id: string) => Promise<void>;
}

export function AlertDetailModal({
    alert,
    isOpen,
    onClose,
    onResolve,
}: AlertDetailModalProps) {
    if (!alert) return null;

    const isResolved = alert.status === 'RESOLVED';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'}>
                            {alert.severity}
                        </Badge>
                        {isResolved && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Résolu
                            </Badge>
                        )}
                    </div>
                    <DialogTitle>{alert.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.createdAt ? format(new Date(alert.createdAt), "d MMMM yyyy HH:mm", { locale: fr }) : "N/A"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Description
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                            {alert.description || "Aucun détail supplémentaire fourni par le système."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Impact estimé</div>
                            <div className="text-sm font-semibold">{alert.severity === 'CRITICAL' ? 'Critique' : 'Moyen'}</div>
                        </div>
                        <div className="p-3 rounded-lg border">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Type</div>
                            <div className="text-sm font-semibold">Automatique</div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    {!isResolved && onResolve && (
                        <Button
                            onClick={async () => {
                                await onResolve(alert.id);
                                onClose();
                            }}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Marquer comme résolu
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
