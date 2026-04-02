-- Run this in your Supabase SQL Editor to fix the constraint case mismatch
ALTER TABLE public.opportunities 
  DROP CONSTRAINT IF EXISTS opportunities_status_check;

ALTER TABLE public.opportunities 
  ADD CONSTRAINT opportunities_status_check 
  CHECK (LOWER(status) IN ('active', 'closed', 'draft'));
