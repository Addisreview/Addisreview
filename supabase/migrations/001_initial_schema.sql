-- ============================================================
-- AddisReview — Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ─── PROFILES ─────────────────────────────────────────────
-- Extends Supabase Auth users with app-specific data
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name  TEXT,
  avatar_url    TEXT,
  is_business_owner BOOLEAN DEFAULT FALSE,
  review_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── CITIES ───────────────────────────────────────────────
CREATE TABLE public.cities (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  name_am     TEXT,                        -- Amharic name
  emoji       TEXT DEFAULT '🏙️',
  region      TEXT,
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  place_count INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.cities (name, name_am, emoji, region, lat, lng, place_count) VALUES
  ('Addis Ababa', 'አዲስ አበባ', '🏙️', 'Addis Ababa', 9.0320, 38.7469, 0),
  ('Gondar',      'ጎንደር',     '🕌', 'Amhara',      12.6090, 37.4660, 0),
  ('Hawassa',     'ሃዋሳ',      '🌊', 'Sidama',      7.0504, 38.4955, 0),
  ('Lalibela',    'ላሊበላ',     '⛰️', 'Amhara',      12.0319, 39.0473, 0),
  ('Dire Dawa',   'ድሬዳዋ',     '🌅', 'Dire Dawa',   9.5930, 41.8661, 0),
  ('Bahir Dar',   'ባህር ዳር',   '🏔️', 'Amhara',      11.5942, 37.3909, 0),
  ('Jimma',       'ጅማ',       '🌿', 'Oromia',      7.6780, 36.8340, 0),
  ('Mekelle',     'መቀሌ',      '🗺️', 'Tigray',      13.4967, 39.4767, 0);

-- ─── CATEGORIES ───────────────────────────────────────────
CREATE TABLE public.categories (
  id    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '📍',
  sort_order INTEGER DEFAULT 0
);

INSERT INTO public.categories (name, slug, emoji, sort_order) VALUES
  ('Restaurants',   'restaurants',   '🍛', 1),
  ('Coffee & Buna', 'coffee',        '☕', 2),
  ('Hotels',        'hotels',        '🏨', 3),
  ('Spas',          'spas',          '💆', 4),
  ('Shopping',      'shopping',      '🛍️', 5),
  ('Entertainment', 'entertainment', '🎵', 6),
  ('Healthcare',    'healthcare',    '🏥', 7),
  ('Services',      'services',      '🔧', 8);

-- ─── BUSINESSES ───────────────────────────────────────────
CREATE TABLE public.businesses (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Identity
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE,
  description       TEXT,

  -- Classification
  category_id       UUID REFERENCES public.categories(id),
  category_name     TEXT,                  -- denormalized for speed
  city_id           UUID REFERENCES public.cities(id),
  city_name         TEXT,                  -- denormalized for speed

  -- Location
  address           TEXT,
  neighborhood      TEXT,
  lat               DECIMAL(9,6),
  lng               DECIMAL(9,6),

  -- Contact
  phone             TEXT,
  website           TEXT,
  email             TEXT,

  -- Hours (JSON: { "monday": "9am-9pm", ... } or null for closed)
  hours             JSONB DEFAULT '{}',

  -- Features/Highlights
  features          TEXT[] DEFAULT '{}',   -- e.g. ['Free WiFi', 'Parking']

  -- Pricing
  price_range       SMALLINT CHECK (price_range BETWEEN 1 AND 4),  -- 1=$, 4=$$$$

  -- Google Places
  google_place_id   TEXT UNIQUE,
  google_rating     DECIMAL(2,1),
  google_photo_ref  TEXT,

  -- Photos (array of Supabase storage URLs)
  photos            TEXT[] DEFAULT '{}',
  cover_photo_url   TEXT,

  -- Ratings (kept in sync via trigger)
  rating_avg        DECIMAL(3,2) DEFAULT 0,
  review_count      INTEGER DEFAULT 0,

  -- Status
  is_verified       BOOLEAN DEFAULT FALSE,
  is_featured       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  claimed_by        UUID REFERENCES auth.users(id),

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_businesses_search ON public.businesses
  USING GIN (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(neighborhood,'') || ' ' || coalesce(city_name,'')));

CREATE INDEX idx_businesses_city ON public.businesses(city_id);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_businesses_rating ON public.businesses(rating_avg DESC);
CREATE INDEX idx_businesses_featured ON public.businesses(is_featured) WHERE is_featured = TRUE;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses are viewable by everyone"
  ON public.businesses FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Service role can manage businesses"
  ON public.businesses FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Business owners can update their listing"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = claimed_by);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION public.generate_business_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(unaccent(NEW.name), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.businesses WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_slug
  BEFORE INSERT ON public.businesses
  FOR EACH ROW WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_business_slug();

-- ─── REVIEWS ──────────────────────────────────────────────
CREATE TABLE public.reviews (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id   UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL,

  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT NOT NULL CHECK (char_length(body) >= 20),
  tags          TEXT[] DEFAULT '{}',
  photo_urls    TEXT[] DEFAULT '{}',

  helpful_count INTEGER DEFAULT 0,
  is_flagged    BOOLEAN DEFAULT FALSE,
  is_approved   BOOLEAN DEFAULT TRUE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (is_approved = TRUE AND is_flagged = FALSE);

CREATE POLICY "Authenticated users can submit reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Update business rating averages when a review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses
  SET
    rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id) AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id) AND is_approved = TRUE)
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- ─── HELPFUL VOTES ────────────────────────────────────────
CREATE TABLE public.review_helpful (
  review_id   UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote helpful"
  ON public.review_helpful FOR ALL USING (auth.uid() = user_id);

-- ─── SAVED BUSINESSES ─────────────────────────────────────
CREATE TABLE public.saved_businesses (
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

ALTER TABLE public.saved_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saves"
  ON public.saved_businesses FOR ALL USING (auth.uid() = user_id);

-- ─── SEARCH FUNCTION ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.search_businesses(
  search_query TEXT DEFAULT NULL,
  city_filter  TEXT DEFAULT NULL,
  cat_filter   TEXT DEFAULT NULL,
  min_rating   DECIMAL DEFAULT 0,
  price_filter SMALLINT[] DEFAULT NULL,
  open_now     BOOLEAN DEFAULT FALSE,
  sort_by      TEXT DEFAULT 'rating',
  page_num     INTEGER DEFAULT 1,
  page_size    INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID, name TEXT, slug TEXT, description TEXT,
  category_name TEXT, city_name TEXT, neighborhood TEXT,
  address TEXT, lat DECIMAL, lng DECIMAL, phone TEXT,
  hours JSONB, features TEXT[], price_range SMALLINT,
  photos TEXT[], cover_photo_url TEXT,
  rating_avg DECIMAL, review_count INTEGER,
  is_verified BOOLEAN, is_featured BOOLEAN, google_photo_ref TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT b.*,
           COUNT(*) OVER () AS total_count
    FROM public.businesses b
    WHERE b.is_active = TRUE
      AND (search_query IS NULL OR to_tsvector('english',
            coalesce(b.name,'') || ' ' || coalesce(b.description,'') || ' ' || coalesce(b.neighborhood,'') || ' ' || coalesce(b.city_name,'')
           ) @@ plainto_tsquery('english', search_query))
      AND (city_filter IS NULL OR lower(b.city_name) = lower(city_filter))
      AND (cat_filter IS NULL OR lower(b.category_name) = lower(cat_filter))
      AND b.rating_avg >= min_rating
      AND (price_filter IS NULL OR b.price_range = ANY(price_filter))
    ORDER BY
      CASE WHEN sort_by = 'rating' THEN b.rating_avg END DESC,
      CASE WHEN sort_by = 'reviews' THEN b.review_count END DESC,
      b.is_featured DESC,
      b.name ASC
    LIMIT page_size
    OFFSET (page_num - 1) * page_size
  )
  SELECT
    f.id, f.name, f.slug, f.description,
    f.category_name, f.city_name, f.neighborhood,
    f.address, f.lat, f.lng, f.phone,
    f.hours, f.features, f.price_range,
    f.photos, f.cover_photo_url,
    f.rating_avg, f.review_count,
    f.is_verified, f.is_featured, f.google_photo_ref,
    f.total_count
  FROM filtered f;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── SAMPLE DATA (Addis Ababa) ────────────────────────────
-- Inserts demo businesses so the app isn't empty on day 1
INSERT INTO public.businesses (
  name, description, category_name, city_name, neighborhood,
  address, phone, price_range, features,
  rating_avg, review_count, is_featured, is_verified,
  hours, city_id, category_id
)
SELECT
  b.name, b.description, b.category_name, 'Addis Ababa', b.neighborhood,
  b.address, b.phone, b.price_range, b.features,
  b.rating_avg, b.review_count, b.is_featured, TRUE,
  b.hours::jsonb,
  (SELECT id FROM public.cities WHERE name = 'Addis Ababa'),
  (SELECT id FROM public.categories WHERE name = b.category_name)
FROM (VALUES
  ('Yod Abyssinia Cultural Restaurant',
   'An iconic cultural dining experience with traditional music and dance, serving authentic Ethiopian cuisine. Famous for their kitfo, tibs, and doro wot.',
   'Restaurants', 'Bole', 'Bole Sub-City, Woreda 3, Addis Ababa', '+251 11 661 9683', 2,
   ARRAY['Live Music','Cultural Dance','Serves Tej','Parking','Reservations','Fasting Menu'],
   4.9, 312, TRUE,
   '{"monday":"11:00am–11:00pm","tuesday":"11:00am–11:00pm","wednesday":"11:00am–11:00pm","thursday":"11:00am–11:00pm","friday":"11:00am–12:00am","saturday":"10:00am–12:00am","sunday":"10:00am–11:00pm"}'),
  ('Tomoca Coffee',
   'Addis Ababa''s oldest and most beloved coffee house since 1953. Famous for their rich espresso and traditional buna ceremony.',
   'Coffee & Buna', 'Piassa', 'Churchill Avenue, Piassa, Addis Ababa', '+251 11 111 5615', 1,
   ARRAY['Takeout','Historic','Buna Ceremony'],
   4.8, 527, TRUE,
   '{"monday":"7:00am–8:00pm","tuesday":"7:00am–8:00pm","wednesday":"7:00am–8:00pm","thursday":"7:00am–8:00pm","friday":"7:00am–9:00pm","saturday":"7:00am–9:00pm","sunday":"8:00am–7:00pm"}'),
  ('Sheraton Addis',
   'Five-star luxury hotel in the heart of Addis Ababa, offering world-class amenities, multiple restaurants, and stunning views of the city.',
   'Hotels', 'Taitu', 'Taitu Street, Addis Ababa', '+251 11 517 1717', 4,
   ARRAY['Pool','Spa','Gym','Free WiFi','Business Center','Multiple Restaurants'],
   4.7, 891, TRUE,
   '{"monday":"Open 24hrs","tuesday":"Open 24hrs","wednesday":"Open 24hrs","thursday":"Open 24hrs","friday":"Open 24hrs","saturday":"Open 24hrs","sunday":"Open 24hrs"}'),
  ('Lucy Restaurant & Lounge',
   'Named after the famous fossil, Lucy offers refined dining with an elegant rooftop terrace and panoramic city views. Ethiopian and international cuisine.',
   'Restaurants', 'Bole', 'Bole Road, Addis Ababa', '+251 91 123 4567', 3,
   ARRAY['Rooftop','Reservations','Cocktails','Parking'],
   4.7, 214, FALSE,
   '{"monday":"11:00am–12:00am","tuesday":"11:00am–12:00am","wednesday":"11:00am–12:00am","thursday":"11:00am–12:00am","friday":"11:00am–2:00am","saturday":"10:00am–2:00am","sunday":"10:00am–12:00am"}'),
  ('Kategna Restaurant',
   'Best known for their injera with various wots. A local favorite serving hearty, authentic Ethiopian meals at very reasonable prices.',
   'Restaurants', 'Sarbet', 'Sarbet, Addis Ababa', '+251 91 234 5678', 1,
   ARRAY['Fasting Menu','Takeout','Local Favorite'],
   4.5, 189, FALSE,
   '{"monday":"8:00am–10:00pm","tuesday":"8:00am–10:00pm","wednesday":"8:00am–10:00pm","thursday":"8:00am–10:00pm","friday":"8:00am–10:00pm","saturday":"8:00am–10:00pm","sunday":"9:00am–10:00pm"}'),
  ('African Jazz Village',
   'Addis Ababa''s premier live music venue featuring nightly jazz, Ethio-jazz, and traditional music performances. A cultural institution.',
   'Entertainment', 'Bole', 'Bole, Addis Ababa', '+251 11 661 0000', 2,
   ARRAY['Live Music','Bar','Outdoor Seating','Reservations'],
   4.6, 379, TRUE,
   '{"monday":"6:00pm–2:00am","tuesday":"6:00pm–2:00am","wednesday":"6:00pm–2:00am","thursday":"6:00pm–2:00am","friday":"6:00pm–4:00am","saturday":"6:00pm–4:00am","sunday":"6:00pm–2:00am"}'),
  ('Kazanchis Hammam & Spa',
   'Luxurious hammam and spa offering traditional Ethiopian treatments, massages, and wellness services in a serene setting.',
   'Spas', 'Kazanchis', 'Kazanchis, Addis Ababa', '+251 91 345 6789', 3,
   ARRAY['Hammam','Massage','Couples Packages','Appointment Required'],
   4.4, 144, FALSE,
   '{"monday":"9:00am–9:00pm","tuesday":"9:00am–9:00pm","wednesday":"9:00am–9:00pm","thursday":"9:00am–9:00pm","friday":"9:00am–10:00pm","saturday":"9:00am–10:00pm","sunday":"10:00am–8:00pm"}'),
  ('Merkato Central Market',
   'One of the largest open-air markets in Africa. A labyrinthine bazaar of spices, textiles, traditional crafts, and everything in between.',
   'Shopping', 'Merkato', 'Merkato, Addis Ababa', NULL, 1,
   ARRAY['Parking','Local Experience','Wholesale Available'],
   4.3, 208, FALSE,
   '{"monday":"7:00am–7:00pm","tuesday":"7:00am–7:00pm","wednesday":"7:00am–7:00pm","thursday":"7:00am–7:00pm","friday":"7:00am–7:00pm","saturday":"7:00am–7:00pm","sunday":"closed"}')
) AS b(name, description, category_name, neighborhood, address, phone, price_range, features, rating_avg, review_count, is_featured, hours);

-- Update city place counts
UPDATE public.cities c
SET place_count = (SELECT COUNT(*) FROM public.businesses b WHERE b.city_name = c.name AND b.is_active = TRUE);
