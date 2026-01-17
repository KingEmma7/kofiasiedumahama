import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Test email endpoint
 * Use this to test if your email configuration is working
 * GET /api/test-email?to=your-email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testEmail = searchParams.get('to') || 'etagbor@gmail.com';

    console.log('🧪 Testing Resend email configuration...');
    console.log('Environment check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    });

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email - Kofi Asiedu-Mahama',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the Kofi Asiedu-Mahama website.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        note: 'Check your inbox (and spam folder)',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email. Check server logs for details.',
        troubleshooting: {
          checkResendKey: 'Get your Resend API key from https://resend.com/api-keys',
          setEnvVar: 'Add RESEND_API_KEY=re_xxxxxxxxxxxxx to .env.local',
          checkFromAddress: 'Ensure RESEND_FROM_EMAIL is from a verified domain in Resend',
          verifyDomain: 'Go to Resend > Domains > Add & Verify your domain first',
          checkLogs: 'Check server console for detailed error messages',
          note: 'Resend free plan: 3,000 emails/month (vs MailerSend\'s 500/month)',
        },
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}