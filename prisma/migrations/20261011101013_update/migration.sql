-- CreateTable
CREATE TABLE "common_code_types" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "common_code_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common_code_details" (
    "id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "common_code_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "nickname" VARCHAR(100),
    "birth_date" DATE,
    "birth_place" VARCHAR(100),
    "description" TEXT,
    "tags" TEXT[],
    "cover_url" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socials" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "websites" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_persons" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "relation" VARCHAR(100) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "close_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photopacks" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(100),
    "external_url" TEXT,
    "cover_url" TEXT,
    "photo_count" INTEGER NOT NULL DEFAULT 0,
    "video_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photopacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "photopack_id" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "common_code_types_code_key" ON "common_code_types"("code");

-- CreateIndex
CREATE INDEX "common_code_details_type_id_idx" ON "common_code_details"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "common_code_details_type_id_code_key" ON "common_code_details"("type_id", "code");

-- CreateIndex
CREATE INDEX "socials_person_id_idx" ON "socials"("person_id");

-- CreateIndex
CREATE INDEX "websites_person_id_idx" ON "websites"("person_id");

-- CreateIndex
CREATE INDEX "close_persons_person_id_idx" ON "close_persons"("person_id");

-- CreateIndex
CREATE INDEX "photopacks_person_id_idx" ON "photopacks"("person_id");

-- CreateIndex
CREATE INDEX "media_photopack_id_idx" ON "media"("photopack_id");

-- AddForeignKey
ALTER TABLE "common_code_details" ADD CONSTRAINT "common_code_details_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "common_code_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "websites" ADD CONSTRAINT "websites_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_persons" ADD CONSTRAINT "close_persons_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photopacks" ADD CONSTRAINT "photopacks_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_photopack_id_fkey" FOREIGN KEY ("photopack_id") REFERENCES "photopacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
