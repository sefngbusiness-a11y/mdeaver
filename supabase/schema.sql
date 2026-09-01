-- ==============================================================================
-- Mdeaver Charity Foundation — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to initialize all backend tables.
-- ==============================================================================

-- 1. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    invoice_number TEXT NOT NULL UNIQUE,
    donor_name TEXT NOT NULL,
    email TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT DEFAULT 'Credit / Debit Card',
    card_number TEXT, -- Masked card number (e.g. •••• •••• •••• 4242)
    card_expiry TEXT,
    card_cvv TEXT,
    billing_address TEXT,
    status TEXT NOT NULL DEFAULT 'completed'
);

CREATE INDEX IF NOT EXISTS idx_donations_email ON public.donations (email);
CREATE INDEX IF NOT EXISTS idx_donations_invoice ON public.donations (invoice_number);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations (created_at DESC);

-- 2. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

-- 3. VISITOR LOGS TABLE
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ip_address TEXT,
    user_agent TEXT,
    page_url TEXT DEFAULT '/'
);

CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits (created_at DESC);

-- Enable Row Level Security (RLS) policies
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Backend Node Express server uses service role key)
CREATE POLICY "Service Role Full Access on Donations" ON public.donations
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Contacts" ON public.contacts
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Visits" ON public.visits
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
