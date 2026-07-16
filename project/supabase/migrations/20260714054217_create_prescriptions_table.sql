/*
# FastTrackRx — Prescriptions Table & Storage Bucket

1. Purpose
   FastTrackRx is a hospital pharmacy queue management system. Patients upload
   prescriptions via the /rx customer page; pharmacists review and progress them
   through Pending → Packing → Ready for Pickup on the /dashboard page. When a
   prescription is marked "Ready for Pickup" a WhatsApp notification (demo mode)
   is triggered.

2. New Tables
   - `prescriptions`
     - `id`            (int8, primary key, auto-incrementing)
     - `whatsapp_number` (text, not null) — patient's WhatsApp contact number
     - `prescription_file` (text, not null) — public URL of uploaded file in storage
     - `file_name`     (text, not null) — original file name for display
     - `status`        (text, not null, default 'Pending') — Pending | Packing | Ready
     - `created_at`    (timestamptz, default now()) — upload timestamp

3. Storage
   - Create public storage bucket `prescriptions` for uploaded prescription
     images/PDFs. Public read so the pharmacist dashboard can display files
     without per-file signed URLs.

4. Security (RLS)
   - Enable RLS on `prescriptions`.
   - This app has NO patient sign-in (patients are anonymous hospital visitors),
     so policies allow `anon, authenticated` CRUD — the data is intentionally
     shared between the anon customer page and the authenticated pharmacist
     dashboard. The pharmacist login is a simple demo credential check handled
     in the frontend (not Supabase Auth), so RLS remains open to both roles.
   - Storage bucket policies: allow anon+authenticated to upload, and public
     read for uploaded prescription files.
*/

-- ========================================================
-- 1. prescriptions table
-- ========================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    whatsapp_number text NOT NULL,
    prescription_file text NOT NULL,
    file_name text NOT NULL,
    status text NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Packing', 'Ready')),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent) then recreate
DROP POLICY IF EXISTS "anon_select_prescriptions" ON prescriptions;
CREATE POLICY "anon_select_prescriptions"
    ON prescriptions FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "anon_insert_prescriptions" ON prescriptions;
CREATE POLICY "anon_insert_prescriptions"
    ON prescriptions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prescriptions" ON prescriptions;
CREATE POLICY "anon_update_prescriptions"
    ON prescriptions FOR UPDATE
    TO anon, authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prescriptions" ON prescriptions;
CREATE POLICY "anon_delete_prescriptions"
    ON prescriptions FOR DELETE
    TO anon, authenticated
    USING (true);

-- Index for dashboard ordering
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at
    ON prescriptions (created_at DESC);

-- ========================================================
-- 2. Storage bucket for prescription uploads
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow anon + authenticated to upload and read
DROP POLICY IF EXISTS "anon_upload_prescriptions" ON storage.objects;
CREATE POLICY "anon_upload_prescriptions"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "anon_read_prescriptions" ON storage.objects;
CREATE POLICY "anon_read_prescriptions"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "anon_delete_prescriptions_storage" ON storage.objects;
CREATE POLICY "anon_delete_prescriptions_storage"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'prescriptions');
