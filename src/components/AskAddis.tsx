// src/app/api/ask-addis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // --- DEBUG: check env vars are present ---
    const dbHost = process.env.NEXT_PUBLIC_DB_HOST;
    const dbAnon = process.env.NEXT_PUBLIC_DB_ANON;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!dbHost || !dbAnon) {
      console.error('Missing Supabase env vars', { dbHost: !!dbHost, dbAnon: !!dbAnon });
      return NextResponse.json({ error: 'Missing DB config', debug: { dbHost: !!dbHost, dbAnon: !!dbAnon } }, { status: 500 });
    }
    if (!anthropicKey) {
      console.error('Missing ANTHROPIC_API_KEY');
      return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
    }

    // 1. Query Supabase
    const supabase = createClient(dbHost, dbAnon);

    const { data: businesses, error: rpcError } = await (supabase as any).rpc('search_businesses', {
      search_query: message.slice(0, 100),
      city_filter: null,
      cat_filter: null,
      min_rating: 0,
      sort_by: 'rating',
      page_num: 1,
      page_size: 40,
      neighborhood_filter: null,
      open_now: false,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      // Don't bail — fall through to top-rated fallback
    }

    let pool = businesses || [];

    // Fallback: pull top-rated directly if RPC returned nothing
    if (pool.length < 5) {
      const { data: topRated, error: topErr } = await supabase
        .from('businesses')
        .select('id, name, slug, category_name, neighborhood, city_name, google_rating, rating_avg, review_count, description, price_range, features')
        .eq('is_active', true)
        .not('google_rating', 'is', null)
        .order('google_rating', { ascending: false })
        .limit(40) as any;

      if (topErr) console.error('Supabase top-rated error:', topErr);
      pool = [...pool, ...(topRated || [])];
    }

    // Deduplicate and cap at 40
    const seen = new Set<string>();
    const dedupedPool = pool.filter((b: any) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    }).slice(0, 40);

    console.log(`ask-addis: pool size = ${dedupedPool.length} for query "${message}"`);

    if (dedupedPool.length === 0) {
      return NextResponse.json({
        reply: "I couldn't find any businesses to recommend right now. Please try again shortly!",
        recommendations: [],
      });
    }

    // 2. Format businesses for Claude
    const bizList = dedupedPool.map((b: any) => {
      const rating = Number(b.rating_avg) || Number(b.google_rating) || 0;
      const price = b.price_range ? '$'.repeat(b.price_range) : '';
      const features = Array.isArray(b.features) && b.features.length
        ? b.features.slice(0, 4).join(', ')
        : '';
      return `- ${b.name} | ${b.category_name} | ${b.neighborhood || ''}${b.city_name ? ', ' + b.city_name : ''} | Rating: ${rating.toFixed(1)}/5 (${b.review_count || 0} reviews)${price ? ' | ' + price : ''}${b.description ? ' | ' + b.description.slice(0, 120) : ''}${features ? ' | Features: ' + features : ''} | slug: ${b.slug || b.id}`;
    }).join('\n');

    // 3. Call Claude Haiku
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: `You are "Ask Addis", a friendly and knowledgeable local guide for AddisReview — Ethiopia's trusted business review platform. Your job is to help users find the perfect restaurant, café, hotel, spa, or any other business in Ethiopia based on what they're looking for.

You will be given a list of real businesses from the AddisReview database. Recommend 3–4 of the most relevant ones based on the user's request. Be warm, specific, and helpful — like a local friend giving advice.

For each recommendation:
1. State the business name boldly
2. Give one sentence on WHY it fits what they asked for
3. Mention the neighborhood and rating
4. Include the slug so the frontend can link to it

Format each recommendation like this (use this exact format):
**[Business Name]** (slug: the-slug-here)
Why it fits: [one specific sentence]
📍 [Neighborhood] · ⭐ [Rating]/5

End with a short friendly closing line.

If the user asks something unrelated to finding businesses in Ethiopia, politely redirect them. Never make up businesses not in the list. Always respond in English unless the user writes in Amharic, in which case respond in Amharic.`,
        messages: [
          {
            role: 'user',
            content: `User's request: "${message}"\n\nAvailable businesses:\n${bizList}\n\nPlease recommend the best matches.`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return NextResponse.json({
        error: `Anthropic error ${anthropicRes.status}`,
        debug: errText.slice(0, 300),
      }, { status: 502 });
    }

    const aiData = await anthropicRes.json();
    const rawText: string = aiData.content?.[0]?.text || '';

    // 4. Parse slugs for linking
    const recommendations: { name: string; slug: string }[] = [];
    const slugRegex = /\*\*(.+?)\*\*\s*\(slug:\s*([^)]+)\)/g;
    let match;
    while ((match = slugRegex.exec(rawText)) !== null) {
      recommendations.push({ name: match[1].trim(), slug: match[2].trim() });
    }

    return NextResponse.json({ reply: rawText, recommendations });

  } catch (err: any) {
    console.error('ask-addis caught error:', err?.message || err);
    return NextResponse.json({
      error: 'Something went wrong',
      debug: err?.message || String(err),
    }, { status: 500 });
  }
}
