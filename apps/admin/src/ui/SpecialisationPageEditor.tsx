import { useParams } from 'react-router-dom';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import { buildSpecialisationPageConfig } from './specialisationPageConfigs';
import type { Value } from './ContentFields';

type Document = { content: Value; updatedAt: string | null };

/** Maps API flat keys (`slug.section`) to short editor keys. */
function mapLoadedDocuments(
  slug: string,
  raw: Record<string, Document>
): Record<string, Document> {
  const out: Record<string, Document> = {};
  const prefix = `${slug}.`;
  for (const [key, doc] of Object.entries(raw)) {
    if (key.startsWith(prefix)) out[key.slice(prefix.length)] = doc;
  }
  return out;
}

/** Expands short keys back to persisted API keys. */
function mapSavePayload(
  slug: string,
  sections: Record<string, Document>
): Record<string, Document> {
  const out: Record<string, Document> = {};
  for (const [shortKey, doc] of Object.entries(sections)) {
    out[`${slug}.${shortKey}`] = doc;
  }
  return out;
}

export function SpecialisationPageEditor({ canEdit }: { canEdit: boolean }) {
  const { slug = '' } = useParams<{ slug: string }>();
  const decoded = decodeURIComponent(slug);
  const config = buildSpecialisationPageConfig(decoded);

  if (!config) {
    return (
      <div className="cms-editor">
        <p className="cms-error" role="alert">
          Unknown specialisation page slug: <strong>{decoded}</strong>
        </p>
      </div>
    );
  }

  return (
    <AcademicsPageEditor
      canEdit={canEdit}
      config={config}
      mapDocumentsLoaded={(docs) => mapLoadedDocuments(decoded, docs)}
      mapBulkSavePayload={(sections) => ({ sections: mapSavePayload(decoded, sections) })}
    />
  );
}
