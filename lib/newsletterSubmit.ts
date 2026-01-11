/**
 * Newsletter submission handler
 * Works with both API routes (dev) and Google Apps Script (static export)
 */

interface NewsletterData {
  name: string;
  email: string;
  phone?: string | null;
}

export async function submitNewsletter(data: NewsletterData): Promise<{ success: boolean; message: string }> {
  // In development or when API routes are available, use the API route
  if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Newsletter API error:', error);
      return {
        success: false,
        message: 'Failed to submit. Please try again later.',
      };
    }
  }

  // For static export, use Google Apps Script web app
  const googleAppsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
  
  if (googleAppsScriptUrl) {
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors', // Google Apps Script doesn't support CORS properly
      });

      // With no-cors, we can't read the response, so assume success
      return {
        success: true,
        message: 'Thank you for subscribing!',
      };
    } catch (error) {
      console.error('Google Apps Script error:', error);
      return {
        success: false,
        message: 'Failed to submit. Please try again later.',
      };
    }
  }

  // Fallback
  return {
    success: false,
    message: 'Newsletter service not configured.',
  };
}
