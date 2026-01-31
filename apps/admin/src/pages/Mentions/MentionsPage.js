"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MentionsPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const alert_1 = require("@/components/ui/alert");
function MentionsPage() {
    const [mentions, setMentions] = (0, react_1.useState)([]);
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Filters
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedBrand, setSelectedBrand] = (0, react_1.useState)('all');
    const [selectedSentiment, setSelectedSentiment] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        fetchData();
    }, [selectedBrand, selectedSentiment]);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedBrand !== 'all')
                params.brandId = selectedBrand;
            if (selectedSentiment !== 'all')
                params.sentiment = selectedSentiment;
            const [mentionsRes, brandsRes] = await Promise.all([
                api_client_1.apiClient.getMentions(params),
                api_client_1.apiClient.getBrands()
            ]);
            if (mentionsRes.success)
                setMentions(mentionsRes.data);
            if (brandsRes.success)
                setBrands(brandsRes.data);
        }
        catch (err) {
            console.error('Error loading mentions:', err);
            setError('Impossible de charger les mentions. Veuillez réessayer.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const filteredMentions = mentions.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchQuery.toLowerCase()));
    const getSentimentBadge = (sentiment) => {
        switch (sentiment) {
            case 'POSITIVE':
                return <badge_1.Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1">
                    <lucide_react_1.ThumbsUp className="w-3 h-3"/> Positif
                </badge_1.Badge>;
            case 'NEGATIVE':
                return <badge_1.Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none flex items-center gap-1">
                    <lucide_react_1.ThumbsDown className="w-3 h-3"/> Négatif
                </badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none flex items-center gap-1">
                    <lucide_react_1.Minus className="w-3 h-3"/> Neutre
                </badge_1.Badge>;
        }
    };
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mentions & Retours</h1>
                    <p className="text-sm text-muted-foreground">
                        Visualisez et analysez ce qui se dit sur vos marques
                    </p>
                </div>
                <button_1.Button onClick={fetchData} variant="outline" size="sm" className="h-9">
                    <lucide_react_1.RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
                    Rafraîchir
                </button_1.Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Rechercher dans le contenu..." className="pl-10 h-10 border-none bg-muted/50 focus-visible:ring-1" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Marque:</span>
                        <select_1.Select value={selectedBrand} onValueChange={setSelectedBrand}>
                            <select_1.SelectTrigger className="w-[160px] h-10 bg-muted/50 border-none">
                                <select_1.SelectValue placeholder="Toutes"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                                <select_1.SelectItem value="all">Toutes les marques</select_1.SelectItem>
                                {brands.map(brand => (<select_1.SelectItem key={brand.id} value={brand.id}>{brand.name}</select_1.SelectItem>))}
                            </select_1.SelectContent>
                        </select_1.Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Sentiment:</span>
                        <select_1.Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                            <select_1.SelectTrigger className="w-[140px] h-10 bg-muted/50 border-none">
                                <select_1.SelectValue placeholder="Tous"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                                <select_1.SelectItem value="all">Tous</select_1.SelectItem>
                                <select_1.SelectItem value="POSITIVE">Positif</select_1.SelectItem>
                                <select_1.SelectItem value="NEUTRAL">Neutre</select_1.SelectItem>
                                <select_1.SelectItem value="NEGATIVE">Négatif</select_1.SelectItem>
                            </select_1.SelectContent>
                        </select_1.Select>
                    </div>
                </div>
            </div>

            {error && (<alert_1.Alert variant="destructive" className="mb-6">
                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                </alert_1.Alert>)}

            {/* List */}
            <div className="space-y-4">
                {isLoading ? ([1, 2, 3, 4].map(i => (<div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border"/>))) : filteredMentions.length === 0 ? (<div className="text-center py-20 bg-card border border-dashed rounded-xl">
                        <lucide_react_1.MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20"/>
                        <h3 className="text-lg font-medium">Aucune mention trouvée</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || selectedBrand !== 'all' || selectedSentiment !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les premières mentions apparaîtront après la collecte.'}
                        </p>
                    </div>) : (filteredMentions.map((mention) => (<card_1.Card key={mention.id} className="group hover:border-sidebar-primary/20 transition-all overflow-hidden border-border/50">
                            <card_1.CardContent className="p-0">
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
                                            {mention.url && (<button_1.Button variant="ghost" size="icon" asChild>
                                                    <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                                        <lucide_react_1.ExternalLink className="w-4 h-4 text-muted-foreground hover:text-blue-600"/>
                                                    </a>
                                                </button_1.Button>)}
                                        </div>
                                    </div>
                                </div>
                            </card_1.CardContent>
                        </card_1.Card>)))}
            </div>
        </div>);
}
