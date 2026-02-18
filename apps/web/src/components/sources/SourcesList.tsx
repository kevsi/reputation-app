import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { SourceCard } from './SourceCard';
import ConnectSourceModal from './ConnectSourceModal';
import type { Source } from '@/types/models';

interface SourcesListProps {
  brandId: string;
}

export default function SourcesList({ brandId }: SourcesListProps) {
  const { apiClient } = useApi();
  const [showModal, setShowModal] = useState(false);

  const {
    data: sources = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const response = await apiClient.getSources();
      return Array.isArray(response.data) ? (response.data as Source[]) : [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sources de mentions</h2>
        <Button onClick={() => setShowModal(true)}>
          + Connecter une source
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Erreur lors du chargement des sources
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-4">Aucune source connectée</p>
          <Button onClick={() => setShowModal(true)}>
            Connecter votre première source
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onDelete={() => refetch()}
              onScrapeNow={() => refetch()}
            />
          ))}
        </div>
      )}

      <ConnectSourceModal
        brandId={brandId}
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
