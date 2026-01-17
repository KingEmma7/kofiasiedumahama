import { Resend } from 'resend';

const ADMIN_EMAILS_DEFAULT = ['etagbor@gmail.com', 'ennasiedu8@gmail.com'] as const;

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [...ADMIN_EMAILS_DEFAULT];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Send transactional email using Resend
 * Free plan: 3,000 emails/month
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set; cannot send transactional email.');
    console.error('Get your API key from https://resend.com/api-keys');
    return false;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    console.error('RESEND_FROM_EMAIL is not set; cannot send transactional email.');
    return false;
  }

  const toList = Array.isArray(params.to) ? params.to : [params.to];
  // Strip HTML tags to create plain text version
  const text = params.text ?? params.html.replaceAll(/<[^>]*>/g, '');

  try {
    const resend = new Resend(resendApiKey);
    
    // Resend supports sending to multiple recipients in one call
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toList,
      subject: params.subject,
      html: params.html,
      text: text,
    });

    if (error) {
      console.error('Resend API error:', error);
      return false;
    }

    if (!data) {
      console.error('Resend returned no data');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resend email send failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}

/**
 * Send admin purchase notification emails
 */
export async function sendAdminPurchaseNotification(params: {
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const admins = getAdminEmails();
  if (admins.length === 0) return true;
  const results = await Promise.all(
    admins.map((to) =>
      sendEmail({
        to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      })
    )
  );
  return results.every(Boolean);
}
