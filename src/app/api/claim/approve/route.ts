// src/app/api/claim/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { claimId, action } = await request.json();
    if (!claimId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_DB_HOST!,
      process.env.DB_SERVICE_KEY!
    );

    // 1. Get the claim details
    const { data: claim, error: claimErr } = await supabase
      .from('business_claims')
      .select('*, businesses(name, slug)')
      .eq('id', claimId)
      .single() as any;

    if (claimErr || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // 2. Update claim status
    await supabase
      .from('business_claims')
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq('id', claimId);

    // 3. If approved, find user by email and update business
    if (action === 'approved') {
      let userId = claim.user_id;

      // If no user_id on the claim, look up by email directly in auth.users
      if (!userId && claim.email) {
        const { data: userData, error: userErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', (
            await supabase.rpc('get_user_id_by_email', { email_input: claim.email })
          ).data)
          .single() as any;

        // Simpler approach — query auth.users directly via admin API
        const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (!listErr && users) {
          const match = users.find((u: any) =>
            u.email?.toLowerCase().trim() === claim.email?.toLowerCase().trim()
          );
          if (match) {
            userId = match.id;
            // Save it back to the claim
            await supabase
              .from('business_claims')
              .update({ user_id: userId })
              .eq('id', claimId);
          }
        }
      }

      // Update the business
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          is_claimed: true,
          claimed_by: userId || null,
          is_verified: true,
        })
        .eq('id', claim.business_id);

      console.log('Business update:', { businessId: claim.business_id, userId, bizErr });
    }

    // 4. Send approval email
    const businessName = claim.businesses?.name || 'your business';

    const emailHtml = action === 'approved'
      ? `
        <div style="font-family: DM Sans, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-family: Georgia, serif; color: #1a5c3a; font-size: 2rem; margin-bottom: 8px;">AddisReview</h1>
          <h2 style="font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 16px;">🎉 Your claim has been approved!</h2>
          <p style="color: #444; line-height: 1.7; margin-bottom: 20px;">
            Hi ${claim.full_name},<br><br>
            Your claim for <strong>${businessName}</strong> has been approved. You are now the verified owner on AddisReview.
          </p>
          <a href="https://www.addisreviews.com/dashboard" style="background: #1a5c3a; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block; margin-bottom: 32px;">
            Go to My Dashboard →
          </a>
          <p style="color: #888; font-size: 0.85rem;">AddisReview · Ethiopia's trusted local guide</p>
        </div>
      `
      : `
        <div style="font-family: DM Sans, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-family: Georgia, serif; color: #1a5c3a; font-size: 2rem; margin-bottom: 8px;">AddisReview</h1>
          <h2 style="font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 16px;">Your claim could not be approved</h2>
          <p style="color: #444; line-height: 1.7; margin-bottom: 20px;">
            Hi ${claim.full_name},<br><br>
            Unfortunately we were unable to verify your ownership of <strong>${businessName}</strong>.
            Please contact us at <a href="mailto:hello@addisreviews.com">hello@addisreviews.com</a>.
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
        from: 'AddisReview <noreply@addisreview.co>',
        to: claim.email,
        subject: action === 'approved'
          ? `✅ Your claim for ${businessName} is approved!`
          : `Your claim for ${businessName} could not be approved`,
        html: emailHtml,
      }),
    });

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    console.error('approve-claim error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
