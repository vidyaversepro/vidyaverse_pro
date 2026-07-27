import { IntegrationLaunchPanel } from '@/components/integrations/IntegrationLaunchPanel';

export default function AITutorPage() {
  return (
    <IntegrationLaunchPanel
      integrationKey="ai_tutor"
      label="AI Tutor"
      description="Connect and launch DigiClassroom — NCERT AI tutor, doubt-clearing, practice tests & notes"
    />
  );
}
