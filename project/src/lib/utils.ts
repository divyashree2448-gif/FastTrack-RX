import { WHATSAPP_MESSAGE, WHATSAPP_COUNTRY_CODE, type PrescriptionStatus } from './constants';

/**
 * Builds a WhatsApp click-to-chat (wa.me) URL so the pharmacist can send a
 * real WhatsApp message to the patient. The wa.me link opens WhatsApp (web or
 * app) with the phone number and message pre-filled — the pharmacist just taps
 * Send. No API key or server-side integration required.
 */
export async function sendWhatsAppNotification(
  whatsappNumber: string,
  _prescriptionId: number,
): Promise<{ success: boolean; message: string; waLink: string }> {
  // Simulate a brief delay for UI feedback
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Strip all non-digit characters from the user-entered number
  const rawDigits = whatsappNumber.replace(/\D/g, '');

  // Prepend country code if the number doesn't already start with one.
  // Local numbers like "999 999 9999" (10 digits) become "919999999999".
  const fullNumber =
    rawDigits.length <= 10 ? `${WHATSAPP_COUNTRY_CODE}${rawDigits}` : rawDigits;

  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
  const waLink = `https://wa.me/${fullNumber}?text=${encodedMessage}`;

  console.log('[FastTrackRx] WhatsApp click-to-chat link generated');
  console.log('  Number:', fullNumber);
  console.log('  Link:', waLink);

  return { success: true, message: WHATSAPP_MESSAGE, waLink };
}

export function getStatusColor(status: PrescriptionStatus): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Packing':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Ready':
      return 'bg-medical-100 text-medical-700 border-medical-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStatusDot(status: PrescriptionStatus): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500';
    case 'Packing':
      return 'bg-blue-500';
    case 'Ready':
      return 'bg-medical-500';
    default:
      return 'bg-slate-400';
  }
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
