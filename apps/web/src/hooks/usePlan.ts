import { useAuth } from '@/contexts/AuthContext';

export function usePlan() {
  const { user } = useAuth();

  const plan = user?.organization?.subscription?.plan || 'FREE';
  const status = user?.organization?.subscription?.status || 'ACTIVE';

  const isActive = status === 'ACTIVE';

  const hasFeature = (feature: string) => {
    if (!isActive) return false;

    const features: Record<string, string[]> = {
      FREE: ['basic_mentions', 'basic_reports'],
      STARTER: ['basic_mentions', 'basic_reports', 'alerts', 'sources'],
      PRO: ['basic_mentions', 'basic_reports', 'alerts', 'sources', 'analysis', 'actions'],
      PREMIUM: ['basic_mentions', 'basic_reports', 'alerts', 'sources', 'analysis', 'actions', 'advanced_reports'],
      TEAM: ['basic_mentions', 'basic_reports', 'alerts', 'sources', 'analysis', 'actions', 'advanced_reports', 'team_management'],
      ENTERPRISE: ['all']
    };

    const planFeatures = features[plan] || [];
    return planFeatures.includes(feature) || planFeatures.includes('all');
  };

  return {
    plan,
    status,
    isActive,
    hasFeature
  };
}