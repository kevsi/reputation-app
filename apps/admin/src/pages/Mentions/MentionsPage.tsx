import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import {
    Search,
    Filter,
    MessageSquare,
    Calendar,
    ExternalLink,
    ThumbsUp,
    ThumbsDown,
    Minus,
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Mention {
    id: string;
    content: string;
    author: string | null;
    url: string | null;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    publishedAt: string;
    source: {
        name: string;
        type: string;
    };
    brand: {
        name: string;
    };
}

interface Brand {
    id: string;
    name: string;
}

export default function MentionsPage() {
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedSentiment, setSelectedSentiment] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, [selectedBrand, selectedSentiment]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (selectedBrand !== 'all') params.brandId = selectedBrand;
            if (selectedSentiment !== 'all') params.sentiment = selectedSentiment;

            const [mentionsRes, brandsRes] = await Promise.all([
                apiClient.getMentions(params),
                apiClient.getBrands()
            ]);

            if (mentionsRes.success) setMentions(mentionsRes.data);
            if (brandsRes.success) setBrands(brandsRes.data);
        } catch (err: any) {
            console.error('Error loading mentions:', err);
            setError('Impossible de charger les mentions. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMentions = mentions.filter(m =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSentimentBadge = (sentiment: string) => {
        switch (sentiment) {
            case 'POSITIVE':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Positif
                </Badge>;
            case 'NEGATIVE':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3" /> Négatif
                </Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none flex items-center gap-1">
                    <Minus className="w-3 h-3" /> Neutre
                </Badge>;
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mentions & Retours</h1>
                    <p className="text-sm text-muted-foreground">
                        Visualisez et analysez ce qui se dit sur vos marques
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm" className="h-9">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Rafraîchir
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher dans le contenu..."
                        className="pl-10 h-10 border-none bg-muted/50 focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Marque:</span>
                        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                            <SelectTrigger className="w-[160px] h-10 bg-muted/50 border-none">
                                <SelectValue placeholder="Toutes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les marques</SelectItem>
                                {brands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Sentiment:</span>
                        <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                            <SelectTrigger className="w-[140px] h-10 bg-muted/50 border-none">
                                <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="POSITIVE">Positif</SelectItem>
                                <SelectItem value="NEUTRAL">Neutre</SelectItem>
                                <SelectItem value="NEGATIVE">Négatif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border" />
                    ))
                ) : filteredMentions.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-dashed rounded-xl">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Aucune mention trouvée</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || selectedBrand !== 'all' || selectedSentiment !== 'all'
                                ? 'Essayez de modifier vos filtres'
                                : 'Les premières mentions apparaîtront après la collecte.'}
                        </p>
                    </div>
                ) : (
                    filteredMentions.map((mention) => (
                        <Card key={mention.id} className="group hover:border-sidebar-primary/20 transition-all overflow-hidden border-border/50">
                            <CardContent className="p-0">
                                <div className="p-5">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Badge & Info Column */}
                                        <div className="flex flex-row md:flex-col justify-between md:justify-start gap-2 min-w-[120px]">
                                            {getSentimentBadge(mention.sentiment)}
                                            <div className="flex flex-col gap-1 items-end md:items-start text-[10px] text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1 font-medium bg-muted px-1.5 py-0.5 rounded">
                                                    {mention.source.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {new Date(mention.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-foreground">{mention.author || 'Anonyme'}</span>
                                                <span className="text-[10px] text-muted-foreground px-1.5 rounded-full border">
                                                    {mention.brand.name}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                                                {mention.content}
                                            </p>
                                        </div>

                                        {/* Action Column */}
                                        <div className="flex items-end md:items-start justify-end">
                                            {mention.url && (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-blue-600" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
