import { NextRequest, NextResponse } from 'next/server';
import { upsertSubscriber, getBrevoListIds } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!email?.includes('@')) {
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

    const listIds = getBrevoListIds();
    if (listIds.length === 0) {
      console.warn('BREVO_LIST_ID or BREVO_LIST_IDS is not set - contact will be created without list assignment');
    }

    await upsertSubscriber({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone?.trim() || undefined,
      listIds,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! You have been added to our mailing list.',
    });
  } catch (error) {
    console.error('Brevo newsletter subscription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Subscription failed. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

