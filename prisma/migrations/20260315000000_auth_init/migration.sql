ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
UPDATE "User" SET "passwordHash" = 'legacy' WHERE "passwordHash" IS NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
