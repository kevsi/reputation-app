import { useState } from 'react';
import { useForm, type Control, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, Plus } from 'lucide-react';
import { sourcesService } from '@/services/sources.service';
import type { SourceType } from '@/types/models';
import { SourceTypeSelector } from './SourceTypeSelector';

// Validation schema
const sourceFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').min(2, 'Minimum 2 caractères'),
  type: z.string().min(1, 'Type de source requis'),
  baseUrl: z.string().url('URL valide requise'),
  keywords: z.array(z.string().min(1)).min(1, 'Au moins 1 mot-clé requis'),
  scrapingFrequency: z.number().min(3600000).default(21600000), // 6 hours default
});

type SourceFormData = z.infer<typeof sourceFormSchema>;

interface SourceFormProps {
  brandId: string;
  onSuccess?: (source: any) => void;
  onCancel?: () => void;
}

export default function SourceForm({
  brandId,
  onSuccess,
  onCancel,
}: SourceFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);
  const [keywordInput, setKeywordInput] = useState('');

  const form = useForm<SourceFormData>({
    resolver: zodResolver(sourceFormSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      type: '',
      baseUrl: '',
      keywords: [],
      scrapingFrequency: 21600000,
    },
  });

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    const currentKeywords = form.getValues('keywords');
    if (!currentKeywords.includes(trimmed)) {
      form.setValue('keywords', [...currentKeywords, trimmed], {
        shouldValidate: true,
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords');
    form.setValue(
      'keywords',
      currentKeywords.filter((k) => k !== keyword),
      { shouldValidate: true }
    );
  };

  const handleTypeChange = (type: SourceType) => {
    setSelectedType(type);
    form.setValue('type', type, { shouldValidate: true });
    setError(null);
  };

  const msToScrapingFrequency = (ms: number): string => {
    if (ms <= 3600000) return 'HOURLY';
    if (ms <= 21600000) return 'EVERY_6_HOURS';
    if (ms <= 43200000) return 'DAILY';
    return 'DAILY';
  };

  const buildConfig = (data: SourceFormData): Record<string, unknown> => {
    if (selectedType === 'RSS') {
      return { feedUrl: data.baseUrl };
    }
    if (selectedType === 'TRUSTPILOT') {
      return { companyUrl: data.baseUrl };
    }
    if (selectedType === 'REDDIT') {
      const match = data.baseUrl?.match(/reddit\.com\/r\/([^/]+)/);
      return {
        subreddits: match ? [match[1]] : [data.baseUrl || ''],
        redditClientId: (data as any).redditClientId || '',
        redditClientSecret: (data as any).redditClientSecret || '',
      };
    }
    if (selectedType === 'NEWS') {
      return {
        keywords: data.keywords,
        language: 'fr',
        newsApiKey: (data as any).newsApiKey || '',
      };
    }
    return { url: data.baseUrl, keywords: data.keywords };
  };

  const onSubmit: SubmitHandler<SourceFormData> = async (data) => {
    if (!selectedType) {
      setError('Veuillez sélectionner un type de source');
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const config = buildConfig(data);
      const source = await sourcesService.create(brandId, {
        type: data.type as SourceType,
        name: data.name,
        config,
        scrapingFrequency: msToScrapingFrequency(data.scrapingFrequency),
      });
      onSuccess?.(source);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Source Type Selector */}
        <div>
          <SourceTypeSelector
            value={selectedType}
            onChange={handleTypeChange}
            showClosedAPIs={true}
          />
        </div>

        {selectedType && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">Informations de la source</h3>

            {/* Name */}
            <FormField
              control={form.control as unknown as Control<SourceFormData>}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la source *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`ex: Ma surveillance ${selectedType}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Base URL */}
            <FormField
              control={form.control as unknown as Control<SourceFormData>}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL publique du site *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedType === 'REDDIT'
                          ? 'https://reddit.com/r/technology'
                          : selectedType === 'RSS'
                            ? 'https://example.com/feed.xml'
                            : 'https://example.com'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {selectedType === 'REDDIT' &&
                      'URL d\'une communauté Reddit publique'}
                    {selectedType === 'RSS' &&
                      'Lien du flux RSS'}
                    {!['REDDIT', 'RSS'].includes(selectedType) &&
                      'URL publique du site ou de la page à surveiller'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keywords Section */}
            <div className="space-y-3">
              <div>
                <FormLabel>Mots-clés à surveiller *</FormLabel>
                <FormDescription className="text-xs mt-1">
                  Ces mots-clés seront utilisés pour analyser les mentions sur la source
                </FormDescription>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un mot-clé..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddKeyword}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Keywords Display */}
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg min-h-10">
                {form.watch('keywords').length === 0 ? (
                  <p className="text-xs text-muted-foreground italic w-full">
                    Aucun mot-clé ajouté. Minimum 1 requis.
                  </p>
                ) : (
                  form.watch('keywords').map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-2.5 py-1"
                    >
                      <span>{keyword}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:opacity-70"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))
                )}
              </div>
              {form.formState.errors.keywords && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.keywords.message}
                </p>
              )}
            </div>

            {/* Scraping Frequency */}
            <FormField
              control={form.control as unknown as Control<SourceFormData>}
              name="scrapingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence de scraping</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value={3600000}>Toutes les heures</option>
                      <option value={21600000}>Toutes les 6 heures</option>
                      <option value={43200000}>Toutes les 12 heures</option>
                      <option value={86400000}>Une fois par jour</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isCreating || !selectedType}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer la source'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
