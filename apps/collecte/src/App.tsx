import { useState, useEffect } from 'react'
import {
    RefreshCw,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Minus,
    ExternalLink,
    Calendar,
    User,
    Activity,
    Plus,
    Target,
    Globe,
    Tag,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Mention {
    id: string
    content: string
    author: string
    url: string
    publishedAt: string
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'
    platform: string
    brand?: { name: string }
}

interface Brand {
    id: string
    name: string
}

function App() {
    const [mentions, setMentions] = useState<Mention[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [formName, setFormName] = useState('')
    const [formUrl, setFormUrl] = useState('')
    const [formKeywords, setFormKeywords] = useState('')
    const [formType, setFormType] = useState('TRUSTPILOT')
    const [formBrandId, setFormBrandId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const fetchMentions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/demo/mentions')
            const result = await response.json()
            if (result.success) {
                setMentions(result.data)
                setLastUpdated(new Date())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchBrands = async () => {
        try {
            const response = await fetch('/demo/brands')
            const result = await response.json()
            if (result.success && result.data.length > 0) {
                setBrands(result.data)
                setFormBrandId(result.data[0].id)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchMentions()
        fetchBrands()
        const interval = setInterval(fetchMentions, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSuccessMsg(null)
        setError(null)

        try {
            // Dans un environnement réel, on posterait vers l'API v1
            // Pour ce projet simplifié, on utilise le endpoint proxied
            const response = await fetch('/api/v1/sources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formName,
                    brandId: formBrandId,
                    type: formType,
                    config: {
                        url: formUrl,
                        keywords: formKeywords.split(',').map(k => k.trim()),
                        companyName: formType === 'TRUSTPILOT' ? formName : undefined
                    },
                    scrapingFrequency: 21600 // 6 hours
                })
            })

            const result = await response.json()

            if (result.success) {
                setSuccessMsg(`Source "${formName}" ajoutée avec succès ! Le scraping va démarrer.`)
                setFormName('')
                setFormUrl('')
                setFormKeywords('')
                setTimeout(() => {
                    setSuccessMsg(null)
                    setShowForm(false)
                }, 3000)
            } else {
                setError(result.error?.message || 'Erreur lors de la création')
            }
        } catch (err) {
            setError('Impossible de contacter le serveur API')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'POSITIVE': return <TrendingUp size={18} />
            case 'NEGATIVE': return <TrendingDown size={18} />
            default: return <Minus size={18} />
        }
    }

    const getSentimentClass = (sentiment: string) => {
        switch (sentiment) {
            case 'POSITIVE': return 'badge-positive'
            case 'NEGATIVE': return 'badge-negative'
            default: return 'badge-neutral'
        }
    }

    const stats = {
        total: mentions.length,
        positive: mentions.filter(m => m.sentiment === 'POSITIVE').length,
        negative: mentions.filter(m => m.sentiment === 'NEGATIVE').length,
        neutral: mentions.filter(m => m.sentiment === 'NEUTRAL').length,
    }

    return (
        <div className="app-container">
            <header>
                <div>
                    <h1>Collecte Sentinel</h1>
                    <p style={{ color: '#94a3b8', margin: '0.5rem 0 0' }}>
                        Moteur de collecte & monitoring en temps réel
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="refresh-btn"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => setShowForm(!showForm)}
                    >
                        <Plus size={18} />
                        {showForm ? 'Fermer' : 'Ajouter une source'}
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={fetchMentions}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        {loading ? 'Mise à jour...' : 'Actualiser'}
                    </button>
                </div>
            </header>

            {showForm && (
                <div className="source-form-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Nouvelle Source de Collecte</h2>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleAddSource}>
                        <div className="source-form-grid">
                            <div className="form-group">
                                <label><Target size={14} style={{ marginRight: '4px' }} /> Nom de la source</label>
                                <input
                                    type="text"
                                    placeholder="ex: Trustpilot Nike"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Globe size={14} style={{ marginRight: '4px' }} /> URL vers le site</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formUrl}
                                    onChange={e => setFormUrl(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Tag size={14} style={{ marginRight: '4px' }} /> Mots-clés (séparés par ,)</label>
                                <input
                                    type="text"
                                    placeholder="IA, Cyber, Nike..."
                                    value={formKeywords}
                                    onChange={e => setFormKeywords(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Plateforme</label>
                                <select value={formType} onChange={e => setFormType(e.target.value)}>
                                    <option value="TRUSTPILOT">Trustpilot</option>
                                    <option value="NEWS">Actualités / Presse</option>
                                    <option value="GOOGLE_REVIEWS">Google Reviews</option>
                                    <option value="FORUM">Forums & Blogs</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Marque associée</label>
                                <select value={formBrandId} onChange={e => setFormBrandId(e.target.value)}>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                    {brands.length === 0 && <option value="">Aucune marque trouvée</option>}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 size={18} className="spin" /> Envoi...</> : 'Démarrer la collecte'}
                            </button>
                            {error && <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>}
                            {successMsg && (
                                <span style={{ color: '#4ade80', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 size={16} /> {successMsg}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Mentions</div>
                    <div className="stat-value">{stats.total}</div>
                    <Activity size={24} style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', opacity: 0.1 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-label">Positives</div>
                    <div className="stat-value" style={{ color: '#4ade80' }}>{stats.positive}</div>
                    <TrendingUp size={24} style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', opacity: 0.1, color: '#4ade80' }} />
                </div>
                <div className="stat-card">
                    <div className="stat-label">Négatives</div>
                    <div className="stat-value" style={{ color: '#f87171' }}>{stats.negative}</div>
                    <TrendingDown size={24} style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', opacity: 0.1, color: '#f87171' }} />
                </div>
                <div className="stat-card">
                    <div className="stat-label">Dernière MaJ</div>
                    <div className="stat-value" style={{ fontSize: '1rem' }}>
                        {format(lastUpdated, 'HH:mm:ss')}
                    </div>
                    <Calendar size={24} style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', opacity: 0.1 }} />
                </div>
            </div>

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Dernières Mentions</h2>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Affichage des {mentions.length} derniers résultats
                    </span>
                </div>

                {loading && mentions.length === 0 ? (
                    <div className="loading">Chargement des données...</div>
                ) : error && mentions.length === 0 ? (
                    <div className="empty" style={{ borderColor: '#ef4444', color: '#f87171' }}>
                        <h3>Oups ! Une erreur est survenue</h3>
                        <p>{error}</p>
                        <button className="refresh-btn" onClick={fetchMentions} style={{ margin: '1rem auto' }}>Réessayer</button>
                    </div>
                ) : mentions.length === 0 ? (
                    <div className="empty">
                        <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3>Aucune donnée collectée</h3>
                        <p>Les spiders n'ont pas encore commencé la collecte pour cette source.</p>
                    </div>
                ) : (
                    <div className="mentions-list">
                        {mentions.map((mention) => (
                            <div key={mention.id} className="mention-card">
                                <div className="mention-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="platform-badge">{mention.platform}</div>
                                        <span className="mention-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <User size={14} />
                                            {mention.author}
                                        </span>
                                        {mention.brand && (
                                            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>• {mention.brand.name}</span>
                                        )}
                                    </div>
                                    <span className="mention-date">
                                        {format(new Date(mention.publishedAt), 'd MMMM yyyy, HH:mm', { locale: fr })}
                                    </span>
                                </div>

                                <p className="mention-content">{mention.content}</p>

                                <div className="mention-footer">
                                    <span className={`badge ${getSentimentClass(mention.sentiment)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {getSentimentIcon(mention.sentiment)}
                                        {mention.sentiment}
                                    </span>

                                    <a href={mention.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <ExternalLink size={14} />
                                        Voir la source
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .stat-card {
          position: relative;
          overflow: hidden;
        }
      `}</style>
        </div>
    )
}

export default App
