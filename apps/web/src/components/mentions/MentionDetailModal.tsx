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
import { ExternalLink, Calendar, User, MessageSquare, Globe } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MentionDetail } from "@/types/api";

interface MentionDetailModalProps {
    mention: MentionDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

export function MentionDetailModal({ mention, isOpen, onClose }: MentionDetailModalProps) {
    if (!mention) return null;

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "POSITIVE": return "bg-green-100 text-green-700 border-green-200";
            case "NEGATIVE": return "bg-red-100 text-red-700 border-red-200";
            case "NEUTRAL": return "bg-gray-100 text-gray-700 border-gray-200";
            case "MIXED": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs uppercase">
                            {mention.source?.type || "Source inconnue"}
                        </Badge>
                        <Badge className={getSentimentColor(mention.sentiment)}>
                            {mention.sentiment}
                        </Badge>
                    </div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        {mention.author || "Auteur anonyme"}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {mention.publishedAt
                            ? format(new Date(mention.publishedAt), "PPP 'à' p", { locale: fr })
                            : "Date inconnue"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Content Section */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            Message original
                        </div>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {mention.content}
                        </p>
                    </div>

                    {/* Keywords Section */}
                    {mention.detectedKeywords && mention.detectedKeywords.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                                Mots-clés détectés
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {mention.detectedKeywords.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary">#{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Plateforme</div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Globe className="w-4 h-4" />
                                {mention.source?.type || "Inconnu"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Score de sentiment</div>
                            <div className="text-sm font-medium">
                                {typeof mention.sentimentScore === 'number'
                                    ? `${Math.round(mention.sentimentScore * 100)}%`
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Action 1</Button>
                        <Button variant="outline" size="sm">Action 2</Button>
                    </div>
                    {mention.url && (
                        <Button asChild>
                            <a href={mention.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                Voir l'original
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
