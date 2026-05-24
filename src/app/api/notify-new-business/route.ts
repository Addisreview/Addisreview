import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessName, submittedBy, category, neighborhood } = await request.json();

    const emailHtml = `
      <div style="font-family: DM Sans, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-family: Georgia, serif; color: #1a5c3a; font-size: 2rem; margin-bottom: 8px;">AddisReview</h1>
        <h2 style="font-family: Georgia, serif; font-size: 1.4rem; margin-bottom: 16px;">🏢 New Business Submission</h2>
        <p style="color: #444; line-height: 1.7; margin-bottom: 24px;">
          A new business has been submitted and is waiting for your review.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: 700; color: #333; width: 140px;">Business Name</td>
            <td style="padding: 10px 0; color: #555;">${businessName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: 700; color: #333;">Category</td>
            <td style="padding: 10px 0; color: #555;">${category}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: 700; color: #333;">Neighborhood</td>
            <td style="padding: 10px 0; color: #555;">${neighborhood}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 700; color: #333;">Submitted By</td>
            <td style="padding: 10px 0; color: #555;">${submittedBy}</td>
          </tr>
        </table>
        <a href="https://www.addisreviews.com/admin/claims" style="background: #1a5c3a; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block; margin-bottom: 32px;">
          Review in Admin Panel →
        </a>
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
        from: 'AddisReview <noreply@addisreview.co>',
        to: 'worku.direct@gmail.com',
        subject: `🏢 New Business Submission: ${businessName}`,
        html: emailHtml,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('notify-new-business error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
