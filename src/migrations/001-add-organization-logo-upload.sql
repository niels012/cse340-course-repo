-- ========================================
-- Migration: store uploaded organization logos in the database
-- ========================================
-- Uploaded logos are saved in the database (not as files) because the
-- hosting server's file system is reset on every restart and redeploy.
--
-- logo_filename stays as the fallback image in /public/images
-- (for example placeholder-logo.png) when no logo has been uploaded.
--
-- Safe to run more than once.

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS logo_data BYTEA,
    ADD COLUMN IF NOT EXISTS logo_mime VARCHAR(50),
    ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMPTZ;
