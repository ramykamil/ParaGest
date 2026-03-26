-- ========================================================
-- Phase 2: Clients table + RLS fixes
-- Run this in your Supabase SQL Editor
-- ========================================================

-- 1. Create `clients` table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    type TEXT CHECK (type IN ('Particulier', 'Professionnel')) DEFAULT 'Particulier',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access for authenticated users on clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2. Fix RLS on `produits` (allow full CRUD for authenticated users)
DROP POLICY IF EXISTS "Only admins/personnel can modify produits." ON public.produits;
DROP POLICY IF EXISTS "Public full access" ON public.produits;
DROP POLICY IF EXISTS "Tout le monde peut modifier les produits" ON public.produits;
CREATE POLICY "Authenticated full access on produits" ON public.produits FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix RLS on `ventes` (allow full CRUD for authenticated)
DROP POLICY IF EXISTS "Ventes viewable by authenticated users." ON public.ventes;
DROP POLICY IF EXISTS "Authenticated users can create ventes." ON public.ventes;
CREATE POLICY "Authenticated full access on ventes" ON public.ventes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 4. Fix RLS on `ligne_ventes`
DROP POLICY IF EXISTS "Ligne ventes viewable by authenticated users." ON public.ligne_ventes;
DROP POLICY IF EXISTS "Authenticated users can create ligne ventes." ON public.ligne_ventes;
CREATE POLICY "Authenticated full access on ligne_ventes" ON public.ligne_ventes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 5. Fix RLS on `profils` (allow users to read all profiles and insert their own)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profils;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profils;
CREATE POLICY "Profiles viewable by authenticated" ON public.profils FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert own profile" ON public.profils FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profils FOR UPDATE USING (auth.uid() = id);
