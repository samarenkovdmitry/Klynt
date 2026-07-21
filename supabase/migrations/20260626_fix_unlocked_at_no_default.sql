-- Remove DEFAULT from unlocked_at so new reports are locked until paid
ALTER TABLE reports ALTER COLUMN unlocked_at DROP DEFAULT;

-- Clear any unlocked_at values that were set by the column default, not by payment
-- Safe to run: the payment webhook was added alongside this paywall work,
-- so no real paid unlocks exist yet
UPDATE reports SET unlocked_at = NULL WHERE unlocked_at IS NOT NULL;
