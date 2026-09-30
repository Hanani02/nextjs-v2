import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase, getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;

    // 1. Try uploading to Supabase Storage bucket "portfolio"
    try {
      const supabase = getAdminSupabase();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            source: 'supabase_storage',
          });
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload skipped/failed:', storageErr);
    }

    // 2. Fallback: Save to public/uploads/ directory
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${fileName}`;
      return NextResponse.json({
        success: true,
        url: localUrl,
        source: 'local_storage',
      });
    } catch (localErr) {
      console.warn('Local file save failed, falling back to base64 data URL:', localErr);
    }

    // 3. Last fallback: Data URL
    const mime = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      source: 'data_uri',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload gagal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
