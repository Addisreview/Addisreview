import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;

    if (!file || !businessId) {
      return NextResponse.json({ error: 'Missing file or businessId' }, { status: 400 });
    }

    const admin = createAdminClient();
    const path = `businessPhotos/${businessId}/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from('business-photos')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      console.error('Business photo upload error:', uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from('business-photos').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { data: business, error: fetchErr } = await (admin as any)
      .from('businesses')
      .select('photos')
      .eq('id', businessId)
      .single();

    if (fetchErr) {
      console.error('Failed to fetch business photos:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const existingPhotos: string[] = business?.photos || [];
    const updatedPhotos = [...existingPhotos, publicUrl];

    const { error: updateErr } = await (admin as any)
      .from('businesses')
      .update({ photos: updatedPhotos })
      .eq('id', businessId);

    if (updateErr) {
      console.error('Failed to update business photos:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('upload-business-photo error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
