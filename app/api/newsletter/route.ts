import { NextRequest, NextResponse } from 'next/server';
import { addSubscriptionToSheet, emailExistsInSheet } from '@/lib/googleSheets';

// API routes are dynamic by default, no need to export dynamic

// Newsletter subscription endpoint
// Integrates with Google Sheets, Mailchimp, or ConvertKit

interface MailchimpResponse {
  id?: string;
  email_address?: string;
  status?: string;
  error?: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Prepare subscription data
    const subscriptionData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subscribedAt: new Date().toISOString(),
    };

    // Option 1: Google Sheets integration (Free, no limits)
    const googleSheetsId = process.env.GOOGLE_SHEETS_ID;
    const googleSheetsCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;

    if (googleSheetsId && googleSheetsCredentials) {
      try {
        // Check if email already exists
        const exists = await emailExistsInSheet(subscriptionData.email);
        
        if (exists) {
          return NextResponse.json({
            success: true,
            message: 'You\'re already subscribed!',
          });
        }

        // Add to Google Sheets
        await addSubscriptionToSheet(subscriptionData);
        
        return NextResponse.json({
          success: true,
          message: 'Thank you for subscribing! You\'ve been added to our mailing list.',
        });
      } catch (error) {
        console.error('Google Sheets error:', error);
        // Fall through to other options or return error
        return NextResponse.json(
          { 
            success: false, 
            message: 'Subscription failed. Please try again later.' 
          },
          { status: 500 }
        );
      }
    }

    // Option 2: Mailchimp integration
    const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
    const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
    const mailchimpDataCenter = process.env.MAILCHIMP_DC; // e.g., 'us1'

    if (mailchimpApiKey && mailchimpListId && mailchimpDataCenter) {
      const response = await fetch(
        `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from('anystring:' + mailchimpApiKey).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: subscriptionData.email,
            status: 'pending', // Requires double opt-in
            merge_fields: {
              FNAME: subscriptionData.name.split(' ')[0] || subscriptionData.name,
              LNAME: subscriptionData.name.split(' ').slice(1).join(' ') || '',
              PHONE: subscriptionData.phone || '',
            },
            tags: ['book-landing-page'],
          }),
        }
      );

      const data: MailchimpResponse = await response.json();

      if (response.ok) {
        // Also log to console for backup (in production, use a database)
        console.log('Newsletter subscription:', subscriptionData);
        
        return NextResponse.json({
          success: true,
          message: 'Please check your email to confirm your subscription.',
        });
      } else if (data.title === 'Member Exists') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed!',
        });
      } else {
        console.error('Mailchimp error:', data);
        throw new Error(data.error || 'Subscription failed');
      }
    }

    // Option 3: ConvertKit integration
    const convertKitApiKey = process.env.CONVERTKIT_API_KEY;
    const convertKitFormId = process.env.CONVERTKIT_FORM_ID;

    if (convertKitApiKey && convertKitFormId) {
      const response = await fetch(
        `https://api.convertkit.com/v3/forms/${convertKitFormId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: convertKitApiKey,
            email: subscriptionData.email,
            first_name: subscriptionData.name.split(' ')[0] || subscriptionData.name,
            fields: {
              phone: subscriptionData.phone || '',
            },
          }),
        }
      );

      if (response.ok) {
        // Also log to console for backup
        console.log('Newsletter subscription:', subscriptionData);
        
        return NextResponse.json({
          success: true,
          message: 'Successfully subscribed!',
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Subscription failed');
      }
    }

    // Fallback: Log subscription data if no service is configured
    console.log('Newsletter signup (no service configured):', subscriptionData);
    console.warn('⚠️ No newsletter storage service configured. Please set up Google Sheets or another service.');

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Subscription failed. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

/*
 * NEWSLETTER STORAGE OPTIONS:
 * 
 * The API supports multiple methods for storing newsletter subscriptions:
 * 
 * 1. GOOGLE SHEETS (Recommended - Free, No Limits) ⭐
 *    - Stores: name, email, phone, subscribedAt timestamp
 *    - Features: Free, unlimited storage, easy to view/export
 *    - Setup: See GOOGLE_SHEETS_SETUP.md for detailed instructions
 *    - Add to .env.local:
 *      GOOGLE_SHEETS_ID=your_spreadsheet_id
 *      GOOGLE_SHEETS_NAME=Subscriptions
 *      GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
 * 
 * 2. MAILCHIMP (For email marketing)
 *    - Stores: name, email, phone (in merge fields)
 *    - Features: Email campaigns, automation, analytics
 *    - Setup:
 *      1. Create account at https://mailchimp.com
 *      2. Get API key from Account > Extras > API keys
 *      3. Find List ID in Audience > Settings > Audience name and defaults
 *      4. Data center is last part of API key (e.g., 'us1')
 *      5. Add to .env.local:
 *         MAILCHIMP_API_KEY=your-api-key
 *         MAILCHIMP_LIST_ID=your-list-id
 *         MAILCHIMP_DC=us1
 * 
 * 3. CONVERTKIT (Great for creators)
 *    - Stores: name, email, phone (in custom fields)
 *    - Features: Email sequences, landing pages, subscriber tagging
 *    - Setup:
 *      1. Create account at https://convertkit.com
 *      2. Get API key from Settings > Advanced
 *      3. Create a form and get its ID from the URL
 *      4. Add to .env.local:
 *         CONVERTKIT_API_KEY=your-api-key
 *         CONVERTKIT_FORM_ID=your-form-id
 * 
 * RECOMMENDATION:
 * Start with Google Sheets (free, unlimited) for storing subscriptions.
 * You can always export the data later to use with email marketing services.
 */

