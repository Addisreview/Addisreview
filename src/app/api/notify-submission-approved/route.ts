import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { businessName, businessSlug, submittedById } = await request.json();

    // Get submitter email using admin client
    const admin = createAdminClient();
    const { data: { user }, error } = await admin.auth.admin.getUserById(submittedById);

    if (error || !user?.email) {
      console.error('Could not find submitter:', error);
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    const emailHtml = `
      <div style="font-family: DM Sans, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-family: Georgia, serif; color: #1a5c3a; font-size: 2rem; margin-bottom: 8px;">AddisReview</h1>
        <h2 style="font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 16px;">🎉 Your business is now live!</h2>
        <p style="color: #444; line-height: 1.7; margin-bottom: 20px;">
          Great news! Your submission for <strong>${businessName}</strong> has been reviewed and approved.
          Your business is now live on AddisReview and visible to thousands of users in Addis Ababa.
        </p>
        <a href="https://www.addisreviews.com/business/${businessSlug}" 
           style="background: #1a5c3a; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block; margin-bottom: 16px;">
          View Your Business →
        </a>
        <br/>
        <a href="https://www.addisreviews.com/dashboard" 
           style="background: #f5c518; color: #1c1c1c; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block; margin-bottom: 32px;">
          Go to My Dashboard →
        </a>
        <p style="color: #666; font-size: .9rem; line-height: 1.7; margin-bottom: 20px;">
          From your dashboard you can update your business details, respond to reviews, and manage your listing.
        </p>
        <p style="color: #888; font-size: 0.85rem;">AddisReview · Ethiopia's trusted local guide</p>
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AddisReview <noreply@addisreviews.com>',
        to: user.email,
        subject: `🎉 ${businessName} is now live on AddisReview!`,
        html: emailHtml,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('notify-submission-approved error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
