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
import { Loader2 } from "lucide-react";
import { Brand } from "@/types/models";

interface BrandFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Brand | null;
}

export function BrandFormModal({
    isOpen,
    onOpenChange,
    onSubmit,
    initialData,
}: BrandFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        website: "",
        logo: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                website: initialData.website || "",
                logo: initialData.logo || "",
            });
        } else {
            setFormData({ name: "", description: "", website: "", logo: "" });
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier la marque" : "Nouvelle marque"}</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour {initialData ? "modifier" : "créer"} une marque.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de la marque *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Nike"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea
                            id="desc"
                            placeholder="Une courte description..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Site web</Label>
                        <Input
                            id="website"
                            placeholder="https://..."
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">URL du logo</Label>
                        <Input
                            id="logo"
                            placeholder="https://.../logo.png"
                            value={formData.logo}
                            onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {initialData ? "Sauvegarder" : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
