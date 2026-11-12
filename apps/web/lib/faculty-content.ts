import 'server-only';
import { facultyMasterDefaults, facultyPageDefaults, type FacultyPageContent, type FacultyPageMasters } from '@vsmedu/contracts/academics-faculty';

export async function getFacultyContent(): Promise<{ sections: FacultyPageContent; masters: FacultyPageMasters }> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/academics/faculty`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Faculty CMS API returned ${response.status}`);
    const payload = (await response.json()).data;
    return { sections: { ...facultyPageDefaults, ...payload.sections }, masters: { ...facultyMasterDefaults, ...payload.masters } };
  } catch (error) {
    console.error('Faculty CMS unavailable; using bundled defaults.', error instanceof Error ? error.message : 'Unknown error');
    return { sections: facultyPageDefaults, masters: facultyMasterDefaults };
  }
}
