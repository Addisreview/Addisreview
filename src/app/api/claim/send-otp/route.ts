// src/app/api/claim/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, channel } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          To: phone,
          Channel: channel || 'sms',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio send OTP error:', data);
      return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: 400 });
    }

    return NextResponse.json({ success: true, status: data.status });
  } catch (err: any) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
