import { useEffect } from 'react';
import { useBrand, Brand } from '@/contexts/BrandContext';

/**
 * Hook pour écouter les changements de brand
 * Exécute un callback quand l'utilisateur change de brand
 * 
 * @param onBrandChange - Callback exécuté quand le brand change
 * 
 * @example
 * ```tsx
 * const refetchData = async () => {
 *   const response = await apiClient.getMentions({ brandId: selectedBrand?.id });
 *   setMentions(response.data);
 * };
 * 
 * useBrandListener(refetchData);
 * ```
 */
export function useBrandListener(onBrandChange: (brand: Brand) => void) {
  const { onBrandChange: registerListener } = useBrand();

  useEffect(() => {
    // Enregistrer le listener
    const unsubscribe = registerListener(onBrandChange);

    // Nettoyer le listener au démontage du composant
    return unsubscribe;
  }, [registerListener, onBrandChange]);
}
