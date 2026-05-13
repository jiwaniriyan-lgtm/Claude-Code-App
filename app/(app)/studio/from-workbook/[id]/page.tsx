import FromWorkbookClient from './FromWorkbookClient';

export const metadata = { title: 'Render workbook · CopperAI' };

export default function FromWorkbookPage({ params }: { params: { id: string } }) {
  return <FromWorkbookClient workbookId={params.id} />;
}
