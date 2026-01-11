import { google } from 'googleapis';

/**
 * Google Sheets API utility for storing newsletter subscriptions
 * Uses service account authentication
 */

interface SubscriptionData {
  name: string;
  email: string;
  phone: string | null;
  subscribedAt: string;
}

/**
 * Initialize Google Sheets API client
 */
function getSheetsClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  
  if (!credentials) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
  }

  // Parse the JSON credentials
  let serviceAccountKey;
  try {
    serviceAccountKey = JSON.parse(credentials);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid GOOGLE_SHEETS_CREDENTIALS JSON format: ${errorMessage}`);
  }

  // Authenticate with Google Sheets API
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Escape sheet name for Google Sheets API
 * Sheet names with spaces or special characters need to be wrapped in single quotes
 */
function escapeSheetName(sheetName: string): string {
  // If sheet name contains spaces, special characters, or starts with a number, wrap in single quotes
  if (/[\s\-'"]/.test(sheetName) || /^\d/.test(sheetName)) {
    // Escape single quotes in sheet name by doubling them
    return `'${sheetName.replaceAll("'", "''")}'`;
  }
  return sheetName;
}

/**
 * Get or create a sheet by name
 * Returns the sheet ID (gid) for reliable access
 */
async function getOrCreateSheet(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string
): Promise<number> {
  try {
    // Get spreadsheet metadata to see all sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if sheet exists
    const existingSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName
    );

    const sheetId = existingSheet?.properties?.sheetId;
    if (sheetId !== undefined && sheetId !== null && typeof sheetId === 'number') {
      return sheetId;
    }

    // Sheet doesn't exist, create it
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });

    const newSheetId = addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (newSheetId === undefined || newSheetId === null || typeof newSheetId !== 'number') {
      throw new Error('Failed to create sheet');
    }

    return newSheetId;
  } catch (error) {
    console.error('Error getting/creating sheet:', error);
    throw error;
  }
}

/**
 * Add a subscription to Google Sheets
 */
export async function addSubscriptionToSheet(data: SubscriptionData): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const sheetName = process.env.GOOGLE_SHEETS_NAME || 'Subscriptions';
  const escapedSheetName = escapeSheetName(sheetName);

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is not set');
  }

  const sheets = getSheetsClient();

  // Ensure sheet exists (create if it doesn't)
  await getOrCreateSheet(sheets, spreadsheetId, sheetName);

  // Check if headers exist, if not, add them
  const headerRange = `${escapedSheetName}!A1:D1`;
  try {
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    const headers = headerResponse.data.values?.[0];
    
    // If no headers exist, add them
    if (!headers || headers.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Name', 'Email', 'Phone', 'Subscribed At']],
        },
      });
    }
  } catch (error) {
    // If range doesn't exist, try to add headers using update (which will create the range)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Could not read headers, creating them:', errorMessage);
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Name', 'Email', 'Phone', 'Subscribed At']],
        },
      });
    } catch (updateError) {
      console.error('Failed to create headers:', updateError);
      // Continue anyway - we'll try to append data
    }
  }

  // Append the subscription data
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${escapedSheetName}!A:D`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        data.name,
        data.email,
        data.phone || '',
        new Date(data.subscribedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      ]],
    },
  });
}

/**
 * Check if email already exists in the sheet
 */
export async function emailExistsInSheet(email: string): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const sheetName = process.env.GOOGLE_SHEETS_NAME || 'Subscriptions';
  const escapedSheetName = escapeSheetName(sheetName);

  if (!spreadsheetId) {
    return false;
  }

  try {
    const sheets = getSheetsClient();
    
    // Ensure sheet exists first
    await getOrCreateSheet(sheets, spreadsheetId, sheetName);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${escapedSheetName}!B:B`, // Column B is email
    });

    const rows = response.data.values || [];
    // Skip header row and check if email exists
    return rows.some((row, index) => index > 0 && row[0]?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    // If sheet is empty or doesn't have data yet, email doesn't exist
    console.warn('Error checking email in sheet (assuming new):', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
