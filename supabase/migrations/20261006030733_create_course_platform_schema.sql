/*
# Digital Course Selling Platform - Core Schema

## Overview
Creates the complete database schema for a digital course selling platform with:
- User profiles with referral codes and admin/student roles
- Course catalog with video slots
- Order tracking for course purchases
- Referral tracking with rewards (₹100 per successful referral)
- OTP codes for email verification during signup

## New Tables
1. profiles - Extends auth.users with name, role, referral_code, email_verified
2. courses - Course catalog (title, description, price, total_videos)
3. videos - Individual video slots within courses (10 slots + 1 intro)
4. orders - Purchase records (user_id, course_id, amount, status)
5. referrals - Referral tracking (referrer_id, referred_email, status, reward_amount)
6. otp_codes - Email verification OTP storage

## Security (RLS)
- profiles: users read/update own; admins read all
- courses: public read; admin-only write
- videos: public read; admin-only write
- orders: users read/insert own; admins read all
- referrals: users read own (as referrer); admin update
- otp_codes: anon can insert/update (signup flow)

## Helper Functions
- is_admin() - checks if current user has admin role
- handle_new_user() - trigger to auto-create profile on signup
- generate_referral_code() - generates unique 8-char referral code
*/

-- Profiles table (must exist before is_admin function)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  referral_code text UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 199,
  total_videos integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON courses;
CREATE POLICY "courses_select_all"
ON courses FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "courses_insert_admin" ON courses;
CREATE POLICY "courses_insert_admin"
ON courses FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "courses_update_admin" ON courses;
CREATE POLICY "courses_update_admin"
ON courses FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  slot_number integer NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  video_url text,
  duration text,
  is_published boolean NOT NULL DEFAULT false,
  is_intro boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select_all" ON videos;
CREATE POLICY "videos_select_all"
ON videos FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "videos_insert_admin" ON videos;
CREATE POLICY "videos_insert_admin"
ON videos FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "videos_update_admin" ON videos;
CREATE POLICY "videos_update_admin"
ON videos FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "videos_delete_admin" ON videos;
CREATE POLICY "videos_delete_admin"
ON videos FOR DELETE
TO authenticated
USING (is_admin());

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 199,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_amount integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own" ON referrals;
CREATE POLICY "referrals_select_own"
ON referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR is_admin());

DROP POLICY IF EXISTS "referrals_insert_own" ON referrals;
CREATE POLICY "referrals_insert_own"
ON referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "referrals_update_admin" ON referrals;
CREATE POLICY "referrals_update_admin"
ON referrals FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_select_anon" ON otp_codes;
CREATE POLICY "otp_select_anon"
ON otp_codes FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "otp_insert_anon" ON otp_codes;
CREATE POLICY "otp_insert_anon"
ON otp_codes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "otp_update_anon" ON otp_codes;
CREATE POLICY "otp_update_anon"
ON otp_codes FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, referral_code, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    generate_referral_code(),
    CASE WHEN NEW.email = 'admin@course.com' THEN 'admin' ELSE 'student' END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed: default course
INSERT INTO courses (id, title, description, price, total_videos)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Complete Digital Marketing Mastery',
  'Master digital marketing from scratch with 10 comprehensive video lessons covering SEO, social media, content marketing, paid ads, and more. Perfect for beginners and intermediate marketers.',
  199,
  10
)
ON CONFLICT (id) DO NOTHING;

-- Seed: free intro video slot
INSERT INTO videos (course_id, slot_number, title, description, is_published, is_intro, duration)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  0,
  'Free 5-Minute Introduction',
  'A free preview of what you will learn in this course.',
  false,
  true,
  '5 min'
)
ON CONFLICT DO NOTHING;

-- Seed: 10 video slots
INSERT INTO videos (course_id, slot_number, title, description, is_published, is_intro)
SELECT '00000000-0000-0000-0000-000000000001', g.n,
  CASE g.n
    WHEN 1 THEN 'Introduction to Digital Marketing'
    WHEN 2 THEN 'Search Engine Optimization (SEO) Fundamentals'
    WHEN 3 THEN 'Social Media Marketing Strategy'
    WHEN 4 THEN 'Content Marketing & Copywriting'
    WHEN 5 THEN 'Google Ads & Paid Advertising'
    WHEN 6 THEN 'Facebook & Instagram Ads'
    WHEN 7 THEN 'Email Marketing Automation'
    WHEN 8 THEN 'Analytics & Data-Driven Decisions'
    WHEN 9 THEN 'Affiliate Marketing Basics'
    WHEN 10 THEN 'Building Your Marketing Agency'
  END,
  'Coming Soon - Content will be uploaded soon.',
  false, false
FROM generate_series(1, 10) AS g(n)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
