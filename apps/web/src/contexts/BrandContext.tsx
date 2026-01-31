import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Brand } from '@/types/models';

export type { Brand };

interface BrandContextType {
  brands: Brand[];
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  loading: boolean;
  error: string | null;
  refreshBrands: () => Promise<void>;
  onBrandChange: (callback: (brand: Brand) => void) => () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);
const SELECTED_BRAND_KEY = 'sentinelle_selected_brand_id';

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Utiliser useRef au lieu de useState pour les callbacks
  const brandChangeCallbacksRef = useRef<Array<(brand: Brand) => void>>([]);
  const isLoadingRef = useRef(false);

  // Callback pour enregistrer les listeners
  const onBrandChange = useCallback((callback: (brand: Brand) => void) => {
    brandChangeCallbacksRef.current = [...brandChangeCallbacksRef.current, callback];
    
    // Retourner une fonction de nettoyage
    return () => {
      brandChangeCallbacksRef.current = brandChangeCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Fonction pour définir le brand sélectionné et notifier les listeners
  const handleBrandChange = useCallback((brand: Brand | null) => {
    setSelectedBrand(brand);
    if (brand) {
      localStorage.setItem(SELECTED_BRAND_KEY, brand.id);
      // ✅ Notifier les callbacks immédiatement
      brandChangeCallbacksRef.current.forEach(callback => {
        try {
          callback(brand);
        } catch (err) {
          console.error('Error in brand change callback:', err);
        }
      });
    } else {
      localStorage.removeItem(SELECTED_BRAND_KEY);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await apiClient.getBrands();
      
      if (response.success && Array.isArray(response.data)) {
        const brandsData = response.data as Brand[];
        setBrands(brandsData);
        
        // Récupérer le brand sauvegardé dans localStorage
        const savedBrandId = localStorage.getItem(SELECTED_BRAND_KEY);
        let brandToSelect: Brand | null = null;

        if (savedBrandId) {
          brandToSelect = brandsData.find(b => b.id === savedBrandId) || null;
        }

        // Si pas trouvé dans localStorage, choisir le premier actif
        if (!brandToSelect && brandsData.length > 0) {
          brandToSelect = brandsData.find(b => b.isActive) || brandsData[0];
        }

        // ✅ Seulement définir si c'est vraiment différent
        if (brandToSelect) {
          setSelectedBrand(prev => {
            if (!prev || prev.id !== brandToSelect!.id) {
              handleBrandChange(brandToSelect);
              return brandToSelect;
            }
            return prev;
          });
        }
      } else {
        // Données fictives pour le développement
        const mockBrands: Brand[] = [
          {
            id: '1',
            name: 'iPhone X',
            description: 'Smartphone Apple',
            website: 'https://apple.com',
            logo: '',
            color: '#007AFF',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            organizationId: 'org1'
          },
          {
            id: '2',
            name: 'Samsung Galaxy',
            description: 'Smartphone Samsung',
            website: 'https://samsung.com',
            logo: '',
            color: '#1428A0',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            organizationId: 'org1'
          },
          {
            id: '3',
            name: 'Google Pixel',
            description: 'Smartphone Google',
            website: 'https://store.google.com',
            logo: '',
            color: '#4285F4',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            organizationId: 'org1'
          }
        ];
        setBrands(mockBrands);
        
        const savedBrandId = localStorage.getItem(SELECTED_BRAND_KEY);
        const brandToSelect = savedBrandId 
          ? mockBrands.find(b => b.id === savedBrandId) 
          : mockBrands[0];
        
        if (brandToSelect) {
          setSelectedBrand(prev => {
            if (!prev || prev.id !== brandToSelect.id) {
              handleBrandChange(brandToSelect);
              return brandToSelect;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Erreur lors du chargement des marques');
      
      // Données fictives en cas d'erreur
      const mockBrands: Brand[] = [
        {
          id: '1',
          name: 'iPhone X',
          description: 'Smartphone Apple',
          website: 'https://apple.com',
          logo: '',
          color: '#007AFF',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationId: 'org1'
        }
      ];
      setBrands(mockBrands);
      
      const savedBrandId = localStorage.getItem(SELECTED_BRAND_KEY);
      const brandToSelect = savedBrandId 
        ? mockBrands.find(b => b.id === savedBrandId) 
        : mockBrands[0];
      
      if (brandToSelect) {
        setSelectedBrand(prev => {
          if (!prev || prev.id !== brandToSelect.id) {
            handleBrandChange(brandToSelect);
            return brandToSelect;
          }
          return prev;
        });
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [handleBrandChange]);

  const refreshBrands = useCallback(async () => {
    await loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return (
    <BrandContext.Provider value={{
      brands,
      selectedBrand,
      setSelectedBrand: handleBrandChange,
      loading,
      error,
      refreshBrands,
      onBrandChange
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}