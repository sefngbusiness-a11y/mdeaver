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
    status TEXT NOT NULL DEFAULT 'pending_approval'
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

-- 4. LIVE DONOR CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    read_by_admin BOOLEAN DEFAULT false,
    read_by_user BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_donation_id ON public.chat_messages (donation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at ASC);

-- Enable Row Level Security (RLS) policies
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Backend Node Express server uses service role key)
CREATE POLICY "Service Role Full Access on Donations" ON public.donations
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Contacts" ON public.contacts
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Visits" ON public.visits
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Chat Messages" ON public.chat_messages
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');


-- ==============================================================================
-- 4. ADMIN PROFILES & ROLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'auditor')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles (email);

-- ==============================================================================
-- 5. ADMIN ACTIVITY AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. 'export_csv', 'update_contact_status', 'resend_receipt'
    resource_type TEXT NOT NULL, -- e.g. 'donation', 'contact', 'visit', 'settings'
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs (admin_id);

-- Enable RLS on Admin Tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access on Admin Profiles" ON public.admin_profiles
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Admin Audit Logs" ON public.admin_audit_logs
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

