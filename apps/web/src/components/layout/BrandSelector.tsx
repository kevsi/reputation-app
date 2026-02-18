import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import type { Brand } from '@/types/models';
import { ScrollArea } from '@/components/ui/scroll-area';

export function BrandSelector() {
  const { brands, selectedBrand, setSelectedBrand, loading } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-brand-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  const handleBrandSelect = (brand: Brand) => {
    // Mettre à jour le brand sélectionné
    setSelectedBrand(brand);
    setIsOpen(false);

    // Si on est sur une route de mentions, on met à jour l'URL pour refléter le changement
    if (location.pathname.startsWith('/mentions')) {
      navigate(`/mentions/${brand.id}`);
    }
  };


  if (loading) {
    return (
      <div className="px-3 py-1 rounded-2xl bg-muted animate-pulse">
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (!selectedBrand) {
    return (
      <div className="px-3 py-1 rounded-2xl bg-muted">
        <span className="text-sm text-muted-foreground">Aucune marque</span>
      </div>
    );
  }

  return (
    <div className="relative" data-brand-selector>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 rounded-2xl hover:bg-accent transition-colors"
        aria-label={`Sélectionner une marque (${selectedBrand.name})`}
      >
        {selectedBrand.logo && (
          <img
            src={selectedBrand.logo}
            alt={selectedBrand.name}
            className="w-4 h-4 rounded"
          />
        )}
        {!selectedBrand.logo && selectedBrand.color && (
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: selectedBrand.color }}
          />
        )}
        <span className="text-sm text-foreground font-medium">{selectedBrand.name}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2 font-semibold">
              Marques disponibles
            </div>
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-all ${selectedBrand.id === brand.id
                        ? 'bg-primary/10 hover:bg-primary/20'
                        : 'hover:bg-accent'
                      }`}
                  >
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-4 h-4 rounded flex-shrink-0"
                      />
                    )}
                    {!brand.logo && brand.color && (
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: brand.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium text-foreground truncate">
                        {brand.name}
                      </div>
                      {brand.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {brand.description}
                        </div>
                      )}
                    </div>
                    {selectedBrand.id === brand.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}