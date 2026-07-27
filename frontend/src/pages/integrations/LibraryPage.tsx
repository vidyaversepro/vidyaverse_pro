import { IntegrationLaunchPanel } from '@/components/integrations/IntegrationLaunchPanel';

export default function LibraryPage() {
  return (
    <IntegrationLaunchPanel
      integrationKey="library"
      label="Library"
      description="Connect and launch your PDLMS library — catalog, circulation, AI book-chat & audiobooks"
    />
  );
}
