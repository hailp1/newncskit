-- CreateTable
CREATE TABLE IF NOT EXISTS "theories" (
    "id" SERIAL NOT NULL,
    "theory" VARCHAR(255) NOT NULL,
    "constructs_full" TEXT,
    "constructs_code" VARCHAR(255),
    "note_vi" TEXT,
    "group" VARCHAR(100),
    "domain" VARCHAR(255),
    "dependent_variable" VARCHAR(255),
    "reference" VARCHAR(255),
    "application_vi" TEXT,
    "definition_long" TEXT,
    "constructs_detailed" JSONB,
    "sample_scales" JSONB,
    "related_theories" JSONB,
    "limitations" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "theories_group_idx" ON "theories"("group");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "theories_domain_idx" ON "theories"("domain");

