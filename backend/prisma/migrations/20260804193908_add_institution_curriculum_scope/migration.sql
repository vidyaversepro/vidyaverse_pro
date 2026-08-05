-- CreateTable
CREATE TABLE "institution_curriculum_scopes" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "taxonomy_node_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36),

    CONSTRAINT "institution_curriculum_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "institution_curriculum_scopes_institution_id_idx" ON "institution_curriculum_scopes"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "institution_curriculum_scopes_institution_id_taxonomy_node__key" ON "institution_curriculum_scopes"("institution_id", "taxonomy_node_id");

-- AddForeignKey
ALTER TABLE "institution_curriculum_scopes" ADD CONSTRAINT "institution_curriculum_scopes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
