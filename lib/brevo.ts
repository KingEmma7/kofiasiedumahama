import * as brevo from '@getbrevo/brevo';

/**
 * Brevo (formerly Sendinblue) integration for subscriber management
 * Free plan: Unlimited contacts + 300 emails/day (9,000/month)
 */

function getBrevoClient(): brevo.ContactsApi {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set');
  }

  const contactsApi = new brevo.ContactsApi();
  contactsApi.setApiKey(brevo.ContactsApiApiKeys.apiKey, apiKey);
  return contactsApi;
}

export interface UpsertSubscriberParams {
  email: string;
  name?: string;
  phone?: string;
  listIds?: number[];
}

/**
 * Create or update a subscriber in Brevo
 * Brevo automatically deduplicates by email
 */
export async function upsertSubscriber(params: UpsertSubscriberParams): Promise<void> {
  const { email, name, phone, listIds = [] } = params;
  const client = getBrevoClient();

  // Build attributes object
  // Brevo requires uppercase attribute names (FNAME, LNAME, SMS)
  const attributes: Record<string, string> = {};
  if (name) {
    // Brevo uses FNAME and LNAME (not FIRSTNAME/LASTNAME)
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      attributes.FNAME = nameParts[0];
      attributes.LNAME = nameParts.slice(1).join(' ');
    } else {
      attributes.FNAME = name;
    }
  }
  if (phone) {
    // Brevo uses SMS attribute for phone number (must include country code)
    // Format: +1234567890 or 1234567890 (with country code)
    // If phone doesn't start with +, try to add Ghana country code (+233)
    let formattedPhone = phone.trim();
    
    // If phone starts with 0 (Ghana local format), replace with +233
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+233' + formattedPhone.substring(1);
    }
    // If phone doesn't start with +, add +233 (Ghana) as default
    else if (!formattedPhone.startsWith('+')) {
      // Check if it already has country code (starts with 233 for Ghana)
      if (formattedPhone.startsWith('233')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        // Assume it's a Ghana number and add +233
        formattedPhone = '+233' + formattedPhone;
      }
    }
    
    attributes.SMS = formattedPhone;
  }

  // Create contact data
  const createContact = new brevo.CreateContact();
  createContact.email = email.toLowerCase().trim();
  if (Object.keys(attributes).length > 0) {
    createContact.attributes = attributes;
  }
  if (listIds.length > 0) {
    createContact.listIds = listIds;
  }
  
  // Set updateEnabled to true to update existing contacts
  createContact.updateEnabled = true;

  try {
    await client.createContact(createContact);
  } catch (error: any) {
    // Log the full error for debugging
    const responseBody = error?.response?.data || error?.response?.body;
    console.error('Brevo createContact error:', {
      message: error?.message,
      code: responseBody?.code,
      body: responseBody,
      status: error?.response?.status || error?.response?.statusCode,
    });
    
    // With updateEnabled=true, Brevo should update existing contacts automatically
    // But if it still throws duplicate_parameter, handle it explicitly
    const errorCode = responseBody?.code;
    const isDuplicate = errorCode === 'duplicate_parameter' || errorCode === 'duplicate_unique_field';
    
    if (isDuplicate) {
      // Contact already exists, update it explicitly
      try {
        const updateContact = new brevo.UpdateContact();
        if (Object.keys(attributes).length > 0) {
          updateContact.attributes = attributes;
        }
        if (listIds.length > 0) {
          updateContact.listIds = listIds;
        }
        await client.updateContact(email.toLowerCase().trim(), updateContact);
        return; // Successfully updated
      } catch (updateError: any) {
        console.error('Brevo updateContact error:', {
          message: updateError?.message,
          body: updateError?.response?.body,
        });
        throw updateError;
      }
    }
    
    // Re-throw non-duplicate errors
    throw error;
  }
}

/**
 * Get or create a list ID from environment variable
 * Brevo uses numeric list IDs, but we'll support both number and string
 */
export function getBrevoListIds(): number[] {
  const listIdEnv = process.env.BREVO_LIST_IDS || process.env.BREVO_LIST_ID;
  if (!listIdEnv) {
    return [];
  }

  // Support comma-separated list IDs
  return listIdEnv
    .split(',')
    .map((id) => Number.parseInt(id.trim(), 10))
    .filter((id) => !Number.isNaN(id));
}
