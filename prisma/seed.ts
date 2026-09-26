import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = [
  {
    id: "01a0dcc0-7ac3-72a1-a405-fd3f36ce7c9a",
    code: "SOCIAL_PLATFORMS",
    name: "Social Media",
    details: [
      {
        id: "01a0dcc7-4a3d-7c10-9162-f3a8d3d7dd71",
        code: "INSTAGRAM",
        label: "Instagram",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "01a0dcc7-8000-79d1-8725-06a5b0a6f700",
        code: "X",
        label: "Twitter / X",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: "01a0dcc7-9825-7383-955b-93125a224de1",
        code: "TIKTOK",
        label: "TikTok",
        sortOrder: 3,
        isActive: true,
      },
      {
        id: "01a0dcc7-ac97-7280-a02e-1164a88e6449",
        code: "FACEBOOK",
        label: "Facebook",
        sortOrder: 4,
        isActive: true,
      },
      {
        id: "01a0dcc7-bff5-7e42-9907-5c3f85104a2c",
        code: "YOUTUBE",
        label: "YouTube",
        sortOrder: 5,
        isActive: true,
      },
      {
        id: "01a0dcc9-5fa8-7b22-85c5-e67bce70162a",
        code: "THREADS",
        label: "Threads",
        sortOrder: 6,
        isActive: true,
      },
    ],
  },
  {
    id: "01a0dcc0-c497-7ed2-82dd-f07a2b5ba003",
    code: "WEB_PLATFORMS",
    name: "Website",
    details: [
      {
        id: "01a0dcc8-9fe3-78e1-a16d-38550710b0da",
        code: "TRAKTEER",
        label: "Trakteer",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: "01a0dcc8-b370-7513-85b6-925b00f60ac5",
        code: "PATREON",
        label: "Patreon",
        sortOrder: 3,
        isActive: true,
      },
      {
        id: "01a0dcc8-c52d-72c0-80eb-3b1e22370f6e",
        code: "GITHUB",
        label: "GitHub",
        sortOrder: 4,
        isActive: true,
      },
      {
        id: "01a0dcc8-5124-7c81-af13-72f05e0d2564",
        code: "PERSONAL_WEBSITE",
        label: "Personal Website",
        sortOrder: 1,
        isActive: true,
      },
    ],
  },
  {
    id: "01a0dcc0-fbde-7990-8434-3d1291da29fd",
    code: "PRESET_TAGS",
    name: "List Tags",
    details: [
      {
        id: "01a0dcc8-e53f-7d10-ad90-76d9ee97ef15",
        code: "COSPLAYER",
        label: "Cosplayer",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "01a0dcc9-167c-76b0-93f9-96579036da0f",
        code: "MODEL",
        label: "Model",
        sortOrder: 3,
        isActive: true,
      },
      {
        id: "01a0dcc9-2a00-76e3-8a33-3a37350294d2",
        code: "STREAMER",
        label: "Streamer",
        sortOrder: 4,
        isActive: true,
      },
      {
        id: "01a0dcc9-03e9-7b91-ad0c-fbd73c8c7a11",
        code: "ORANG_BIASA",
        label: "Orang Biasa",
        sortOrder: 2,
        isActive: true,
      },
    ],
  },
];

async function main() {
  console.log("Start seeding...");
  for (const type of seedData) {
    const { details, ...typeData } = type;

    const createdType = await prisma.commonCodeType.upsert({
      where: { code: typeData.code },
      update: typeData,
      create: typeData,
    });
    console.log(`Upserted CommonCodeType: ${createdType.code}`);

    for (const detail of details) {
      const detailData = {
        ...detail,
        typeId: createdType.id,
      };
      await prisma.commonCodeDetail.upsert({
        where: {
          typeId_code: {
            typeId: createdType.id,
            code: detail.code,
          },
        },
        update: detailData,
        create: detailData,
      });
    }
    console.log(`Upserted ${details.length} details for ${createdType.code}`);
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
