import 'server-only';
import { academicsDefaults, academicsMasterDefaults, type AcademicsContent, type AcademicsMasters } from '@vsmedu/contracts/academics';

export async function getAcademicsContent(): Promise<{ sections: AcademicsContent; masters: AcademicsMasters }> {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/academics`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error(`Academics API returned ${response.status}`);
    const json: { data?: { sections?: AcademicsContent; masters?: AcademicsMasters } } = await response.json();
    const sections = json.data?.sections;
    const masters = json.data?.masters;
    if (!sections || !masters) throw new Error('Academics API missing sections or slider data');
    return { sections, masters };
  } catch (error) {
    console.error(
      'Academics content API unavailable; using bundled defaults.',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return { sections: academicsDefaults, masters: academicsMasterDefaults };
  }
}
