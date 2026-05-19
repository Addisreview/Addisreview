// src/app/api/claim/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { phone, code, businessId, userId, fullName, role, email, verificationMethod } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    // 1. Verify the OTP with Twilio
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          To: phone,
          Code: code,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // 2. Save the claim to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_DB_HOST!,
      process.env.DB_SERVICE_KEY!
    );

    const { error: insertError } = await supabase
      .from('business_claims')
      .insert({
        business_id: businessId,
        user_id: userId || null,
        full_name: fullName,
        role,
        email,
        phone,
        verification_method: verificationMethod || 'sms',
        status: 'pending',
      });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save claim' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
