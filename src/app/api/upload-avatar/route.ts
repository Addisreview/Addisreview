import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('upload-avatar called:', { userId, fileName: file?.name, fileSize: file?.size, fileType: file?.type });

    if (!file || !userId) {
      console.log('Missing file or userId');
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    const path = `avatars/${userId}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log('Uploading to path:', path, 'buffer size:', buffer.length);

    const admin = createAdminClient();

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('avatars')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    console.log('Upload result:', { uploadData, uploadErr });

    if (uploadErr) {
      console.error('Avatar upload error:', uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from('avatars').getPublicUrl(path);
    console.log('Public URL:', urlData.publicUrl);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error('upload-avatar error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
