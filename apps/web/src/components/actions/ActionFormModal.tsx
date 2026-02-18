import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Action } from "@/services/actions.service";
import { Loader2 } from "lucide-react";

interface ActionFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<Action>) => Promise<void>;
    initialData?: Action | null;
}

export function ActionFormModal({
    isOpen,
    onOpenChange,
    onSubmit,
    initialData,
}: ActionFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Action>>({
        title: "",
        description: "",
        priority: "Moyenne",
        platform: "Général",
        dueDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
            });
        } else {
            setFormData({
                title: "",
                description: "",
                priority: "Moyenne",
                platform: "Général",
                dueDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            // handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
                    <DialogDescription>
                        Remplissez les détails ci-dessous pour {initialData ? "modifier" : "créer"} une action.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Répondre à l'avis Trustpilot"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Description (optionnel)</Label>
                        <Textarea
                            id="desc"
                            placeholder="Détails de l'action à mener..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Priorité</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Priorité haute">Haute</SelectItem>
                                    <SelectItem value="Moyenne">Moyenne</SelectItem>
                                    <SelectItem value="Faible">Faible</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Échéance</Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="px-8">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {initialData ? "Mettre à jour" : "Créer la tâche"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
