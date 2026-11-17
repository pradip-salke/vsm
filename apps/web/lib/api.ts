/**
 * Browser-facing requests use the website origin. next.config.ts proxies the
 * public API paths to API_BASE_URL, avoiding CORS/CSP differences between hosts.
 */
export const PUBLIC_API_BASE_URL = '';

export type EnquiryPayload = {
  name: string;
  email?: string;
  phone: string;
  city?: string;
  consent: true;
  source?: string;
};

/**
 * Posts to the Express public enquiry endpoint straight from the browser so the
 * API's per-IP rate limit applies to the visitor rather than the Next.js server.
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/public/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429) return { ok: false, message: 'Too many enquiries from this device. Please try again later.' };
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false, message: body?.error?.message ?? 'We could not send your enquiry. Please check the details and try again.' };
  } catch {
    return { ok: false, message: 'We could not reach the server. Please try again or call us.' };
  }
}
