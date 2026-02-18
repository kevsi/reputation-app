import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 md:px-[100px] py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.9986 5.53472L35.5997 0.349121L30.464 18.0001L35.5997 35.6012L17.9986 30.4655L0.347656 35.6012L5.53325 18.0001L0.347656 0.349121L17.9986 5.53472Z" fill="black"/>
            </svg>
          </div>
          <span className="text-2xl font-medium font-space">Sentinelle-Réputation</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <a href="#fonctionnalites" className="text-lg font-space hover:underline">Fonctionnalités</a>
          <a href="#comment-ca-marche" className="text-lg font-space hover:underline">Comment ça marche</a>
          <a href="#pricing" className="text-lg font-space hover:underline">Tarifs</a>
          <a href="#contact" className="text-lg font-space hover:underline">Contact</a>
          <Button className="rounded-[14px] bg-brand-blue text-white px-9 py-5 text-lg h-auto font-space font-normal hover:bg-brand-blue/90">
            Demander une démo
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-[100px] py-16 md:py-24">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-medium leading-tight font-space">
              Surveillez votre réputation avant qu'elle ne devienne une crise
            </h1>
            <p className="text-lg md:text-xl font-space max-w-lg">
              Détection automatique des signaux négatifs sur le web, forums et communautés.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="rounded-[14px] bg-brand-blue text-white px-9 py-6 text-lg h-auto font-space font-normal hover:bg-brand-blue/90">
                Demander une démo
              </Button>
              <Button variant="outline" className="rounded-[14px] border-brand-dark px-9 py-6 text-lg h-auto font-space font-normal hover:bg-brand-grey">
                Voir les fonctionnalités
              </Button>
            </div>
          </div>
          
          <div className="relative h-[400px] lg:h-[515px] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-blue/20 rounded-full blur-3xl"></div>
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="200" r="150" stroke="#191A23" strokeWidth="2" fill="none" opacity="0.1"/>
                <circle cx="200" cy="200" r="100" stroke="#0099FF" strokeWidth="3" fill="none"/>
                <circle cx="200" cy="200" r="50" fill="#0099FF"/>
                <path d="M200 50 L250 100 L200 150 L150 100 Z" fill="#191A23" opacity="0.3"/>
                <path d="M300 200 L250 250 L200 200 L250 150 Z" fill="#0099FF" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 md:px-[100px] py-16 bg-brand-grey">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">Le Problème</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-[45px] p-8 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-medium mb-4 font-space">Avis négatifs invisibles</h3>
              <p className="text-lg font-space">Les avis négatifs apparaissent sans prévenir sur des plateformes que vous ne surveillez pas.</p>
            </div>
            <div className="bg-white rounded-[45px] p-8 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mb-6 text-white">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-medium mb-4 font-space">Forums hors de portée</h3>
              <p className="text-lg font-space">Les forums et communautés échappent à la veille classique et peuvent nuire gravement.</p>
            </div>
            <div className="bg-white rounded-[45px] p-8 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mb-6 text-white">
                <span className="text-3xl">📉</span>
              </div>
              <h3 className="text-xl font-medium mb-4 font-space">Signaux faibles manqués</h3>
              <p className="text-lg font-space">Les crises commencent par des signaux faibles invisibles qui se transforment en tempêtes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 md:px-[100px] py-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">La Solution</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-medium mb-6 font-space">Sentinelle-Réputation vous protège 24/7</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg font-space mb-1">Surveillance continue du web</h4>
                    <p className="text-brand-dark/70 font-space">Veille automatique sur tous les sites, forums et réseaux sociaux pertinents.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg font-space mb-1">Analyse du ton des discussions</h4>
                    <p className="text-brand-dark/70 font-space">Intelligence artificielle pour détecter les sentiments négatifs avant qu'ils se propagent.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg font-space mb-1">Alertes avant propagation</h4>
                    <p className="text-brand-dark/70 font-space">Notifications en temps réel pour agir avant que la crise ne s'installe.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg font-space mb-1">Centralisation des mentions</h4>
                    <p className="text-brand-dark/70 font-space">Tableau de bord unique pour suivre toute votre e-réputation en un coup d'œil.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-brand-dark rounded-[45px] p-12 text-white">
              <div className="space-y-6">
                <div className="bg-brand-blue/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium font-space">Alerte en direct</span>
                  </div>
                  <p className="text-sm font-space">Nouveau commentaire négatif détecté sur Reddit - Forum tech</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                    <span className="font-medium font-space">Sentiment analysé</span>
                  </div>
                  <p className="text-sm font-space">Ton: Négatif (Score: -0.8) - Action recommandée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="px-6 md:px-[100px] py-16 bg-brand-grey">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">Fonctionnalités clés</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 mt-12">
            <div className="bg-white rounded-[45px] p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-block bg-brand-blue rounded-lg px-2 mb-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-white">Veille forums</h3>
                  </div>
                  <div className="inline-block bg-brand-blue rounded-lg px-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-white">& communautés</h3>
                  </div>
                </div>
                <div className="text-4xl">🔍</div>
              </div>
              <p className="text-lg font-space">Surveillance automatique de Reddit, forums spécialisés, et communautés en ligne.</p>
            </div>

            <div className="bg-brand-blue rounded-[45px] p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-block bg-white rounded-lg px-2 mb-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space">Analyse de</h3>
                  </div>
                  <div className="inline-block bg-white rounded-lg px-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space">sentiment</h3>
                  </div>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
              <p className="text-lg font-space text-white">IA avancée pour détecter le ton positif, négatif ou neutre des conversations.</p>
            </div>

            <div className="bg-brand-dark rounded-[45px] p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23] text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-block bg-white rounded-lg px-2 mb-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-brand-dark">Alertes</h3>
                  </div>
                  <div className="inline-block bg-white rounded-lg px-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-brand-dark">intelligentes</h3>
                  </div>
                </div>
                <div className="text-4xl">🔔</div>
              </div>
              <p className="text-lg font-space">Notifications personnalisées par email, Slack ou webhook selon vos préférences.</p>
            </div>

            <div className="bg-white rounded-[45px] p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-block bg-brand-blue rounded-lg px-2 mb-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-white">Tableau de</h3>
                  </div>
                  <div className="inline-block bg-brand-blue rounded-lg px-2">
                    <h3 className="text-2xl md:text-[30px] font-medium font-space text-white">synthèse</h3>
                  </div>
                </div>
                <div className="text-4xl">📊</div>
              </div>
              <p className="text-lg font-space">Vue d'ensemble claire de votre réputation avec graphiques et tendances.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="comment-ca-marche" className="px-6 md:px-[100px] py-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">Comment ça marche</h2>
          </div>
          <p className="text-lg font-space max-w-xl mb-12">Guide étape par étape pour protéger votre réputation</p>
          
          <div className="space-y-6">
            <div className="bg-brand-blue rounded-[45px] p-10 md:p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <span className="text-5xl md:text-[60px] font-medium font-space text-white">01</span>
                  <h3 className="text-2xl md:text-[30px] font-medium font-space text-white">Définissez votre marque et mots-clés</h3>
                </div>
              </div>
              <div className="mt-6 border-t border-white pt-6">
                <p className="text-lg font-space max-w-4xl text-white">
                  Configurez votre marque, vos produits et les mots-clés à surveiller. Sentinelle s'occupe du reste en analysant automatiquement toutes les sources pertinentes.
                </p>
              </div>
            </div>

            <div className="bg-brand-grey rounded-[45px] p-10 md:p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <span className="text-5xl md:text-[60px] font-medium font-space">02</span>
                  <h3 className="text-2xl md:text-[30px] font-medium font-space">Sentinelle surveille automatiquement</h3>
                </div>
              </div>
            </div>

            <div className="bg-brand-grey rounded-[45px] p-10 md:p-12 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <span className="text-5xl md:text-[60px] font-medium font-space">03</span>
                  <h3 className="text-2xl md:text-[30px] font-medium font-space">Vous recevez des alertes exploitables</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 md:px-[100px] py-16 bg-brand-grey">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">Tarifs</h2>
          </div>
          <p className="text-lg font-space max-w-xl mb-12">Choisissez le plan qui correspond à vos besoins</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-[45px] p-10 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="mb-6">
                <div className="inline-block bg-brand-grey rounded-lg px-3 py-1 mb-4">
                  <span className="text-xl font-medium font-space">Starter</span>
                </div>
                <p className="text-lg font-space text-brand-dark/70 mb-6">Pour indépendants & petites marques</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="font-space">Surveillance basique</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Mots-clés limités</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Analyse de sentiment simple</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Alertes par email</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Historique court</span>
                </li>
              </ul>
              
              <Button className="w-full rounded-[14px] border-brand-dark bg-white hover:bg-brand-grey text-brand-dark border px-9 py-6 text-lg h-auto font-space font-normal">
                Commencer
              </Button>
              
              <p className="text-sm font-space text-brand-dark/60 mt-4 text-center">Idéal pour débuter</p>
            </div>

            {/* Premium Plan */}
            <div className="bg-brand-blue rounded-[45px] p-10 border-2 border-brand-dark shadow-[0_5px_0_0_#191A23] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-dark text-white px-6 py-2 rounded-full">
                <span className="font-space font-medium">Recommandé</span>
              </div>
              
              <div className="mb-6 mt-4">
                <div className="inline-block bg-white rounded-lg px-3 py-1 mb-4">
                  <span className="text-xl font-medium font-space">Premium</span>
                </div>
                <p className="text-lg font-space mb-6">Pour entreprises en croissance</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="font-space">Surveillance étendue</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Mots-clés illimités</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Analyse de sentiment avancée</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Alertes temps réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Tableau de bord détaillé</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Historique complet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
                  <span className="font-space">Support prioritaire</span>
                </li>
              </ul>
              
              <Button className="w-full rounded-[14px] bg-white hover:bg-white/90 text-brand-blue px-9 py-6 text-lg h-auto font-space font-normal">
                Commencer
              </Button>

              <p className="text-sm font-space mt-4 text-center text-white">Meilleur rapport valeur/prix</p>
            </div>

            {/* Team Plan */}
            <div className="bg-white rounded-[45px] p-10 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
              <div className="mb-6">
                <div className="inline-block bg-brand-grey rounded-lg px-3 py-1 mb-4">
                  <span className="text-xl font-medium font-space">Team</span>
                </div>
                <p className="text-lg font-space text-brand-dark/70 mb-6">Pour équipes & agences</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="font-space">Tout Premium +</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Multi-utilisateurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Rôles & permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Rapports exportables</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Alertes collaboratives</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Intégrations (Slack, webhook)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="font-space">Support dédié</span>
                </li>
              </ul>
              
              <Button className="w-full rounded-[14px] border-brand-dark bg-white hover:bg-brand-grey text-brand-dark border px-9 py-6 text-lg h-auto font-space font-normal">
                Commencer
              </Button>
              
              <p className="text-sm font-space text-brand-dark/60 mt-4 text-center">Pour travail en équipe</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16 bg-white rounded-[45px] p-10 border border-brand-dark shadow-[0_5px_0_0_#191A23]">
            <h3 className="text-2xl font-medium font-space mb-8">Tableau comparatif</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-dark">
                    <th className="text-left py-4 px-4 font-space font-medium">Fonctionnalité</th>
                    <th className="text-center py-4 px-4 font-space font-medium">Starter</th>
                    <th className="text-center py-4 px-4 font-space font-medium">Premium</th>
                    <th className="text-center py-4 px-4 font-space font-medium">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-brand-grey">
                    <td className="py-4 px-4 font-space">Veille web</td>
                    <td className="text-center py-4 px-4 text-brand-blue font-medium">✓</td>
                    <td className="text-center py-4 px-4 text-brand-blue font-medium">✓✓</td>
                    <td className="text-center py-4 px-4 text-brand-blue font-medium">✓✓</td>
                  </tr>
                  <tr className="border-b border-brand-grey">
                    <td className="py-4 px-4 font-space">Analyse sentiment</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Basique</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Avancée</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Avancée</td>
                  </tr>
                  <tr className="border-b border-brand-grey">
                    <td className="py-4 px-4 font-space">Alertes</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Email</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Temps réel</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Collaboratives</td>
                  </tr>
                  <tr className="border-b border-brand-grey">
                    <td className="py-4 px-4 font-space">Historique</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Limité</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Complet</td>
                    <td className="text-center py-4 px-4 font-space text-sm">Complet</td>
                  </tr>
                  <tr className="border-b border-brand-grey">
                    <td className="py-4 px-4 font-space">Multi-utilisateurs</td>
                    <td className="text-center py-4 px-4">✗</td>
                    <td className="text-center py-4 px-4">✗</td>
                    <td className="text-center py-4 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-space">Intégrations</td>
                    <td className="text-center py-4 px-4">✗</td>
                    <td className="text-center py-4 px-4">✗</td>
                    <td className="text-center py-4 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-[100px] py-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="bg-brand-grey rounded-[45px] p-12 md:p-16 border border-brand-dark relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-medium font-space mb-6">
                Protégez votre réputation dès aujourd'hui
              </h2>
              <p className="text-lg md:text-xl font-space mb-8 text-brand-dark/70">
                Commencez à surveiller votre e-réputation en quelques minutes. Aucune carte bancaire requise pour l'essai gratuit.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="rounded-[14px] bg-brand-blue text-white px-9 py-6 text-lg h-auto font-space font-normal hover:bg-brand-blue/90">
                  Démarrer l'essai gratuit
                </Button>
                <Button variant="outline" className="rounded-[14px] border-brand-dark px-9 py-6 text-lg h-auto font-space font-normal hover:bg-white">
                  Planifier une démo
                </Button>
              </div>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20">
              <svg width="300" height="300" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="100" stroke="#191A23" strokeWidth="2" fill="none"/>
                <path d="M150 50 L200 100 L150 150 L100 100 Z" fill="#0099FF"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 md:px-[100px] py-16 bg-brand-grey">
        <div className="max-w-[1240px] mx-auto">
          <div className="inline-block bg-brand-blue rounded-lg px-2 mb-6">
            <h2 className="text-3xl md:text-[40px] font-medium font-space text-white">Contactez-nous</h2>
          </div>
          <p className="text-lg font-space max-w-xl mb-12">Discutons de vos besoins en gestion de réputation</p>
          
          <div className="bg-white rounded-[45px] p-10 md:p-12 border border-brand-dark">
            <form className="space-y-8 max-w-2xl">
              <RadioGroup defaultValue="demo" className="flex gap-8">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="demo" id="demo" className="border-brand-dark" />
                  <Label htmlFor="demo" className="font-space text-lg cursor-pointer">Demander une démo</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="quote" id="quote" className="border-brand-dark" />
                  <Label htmlFor="quote" className="font-space text-lg cursor-pointer">Obtenir un devis</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="name" className="font-space">Nom</Label>
                <Input 
                  id="name" 
                  placeholder="Votre nom" 
                  className="rounded-[14px] border-brand-dark h-14 font-space"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-space">Email*</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="votre@email.com" 
                  className="rounded-[14px] border-brand-dark h-14 font-space"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-space">Message*</Label>
                <Textarea 
                  id="message" 
                  placeholder="Parlez-nous de vos besoins..." 
                  className="rounded-[14px] border-brand-dark min-h-[150px] font-space"
                  required
                />
              </div>

              <Button className="w-full rounded-[14px] bg-brand-dark text-white px-9 py-6 text-lg h-auto font-space font-normal hover:bg-brand-dark/90">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white px-6 md:px-[100px] py-12 rounded-t-[45px]">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 relative">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.9986 5.53472L35.5997 0.349121L30.464 18.0001L35.5997 35.6012L17.9986 30.4655L0.347656 35.6012L5.53325 18.0001L0.347656 0.349121L17.9986 5.53472Z" fill="white"/>
                  </svg>
                </div>
                <span className="text-xl font-medium font-space">Sentinelle-Réputation</span>
              </div>
              <p className="text-white/70 font-space">Protégez votre réputation en ligne avant qu'elle ne devienne une crise.</p>
            </div>

            <div>
              <h3 className="font-medium font-space mb-4 text-lg">Navigation</h3>
              <ul className="space-y-3">
                <li><a href="#fonctionnalites" className="text-white/70 hover:text-white font-space transition-colors">Fonctionnalités</a></li>
                <li><a href="#comment-ca-marche" className="text-white/70 hover:text-white font-space transition-colors">Comment ça marche</a></li>
                <li><a href="#pricing" className="text-white/70 hover:text-white font-space transition-colors">Tarifs</a></li>
                <li><a href="#contact" className="text-white/70 hover:text-white font-space transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <div className="inline-block bg-brand-blue rounded-lg px-2 mb-4">
                <h3 className="font-medium font-space text-white">Contact</h3>
              </div>
              <ul className="space-y-3 text-white/70 font-space">
                <li>Email: contact@sentinelle-reputation.fr</li>
                <li>Tél: +33 1 23 45 67 89</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium font-space mb-4 text-lg">Newsletter</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Votre email"
                  className="rounded-[14px] bg-brand-dark border-white/30 text-white placeholder:text-white/50 font-space"
                />
                <Button className="rounded-[14px] bg-brand-blue text-white hover:bg-brand-blue/90 font-space px-6">
                  →
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 font-space">© 2024 Sentinelle-Réputation. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/60 hover:text-white font-space transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-white/60 hover:text-white font-space transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
