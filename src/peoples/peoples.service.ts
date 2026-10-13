import * as fs from "fs";
import * as path from "path";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePersonDto } from "./dto/create-person.dto";
import { UpdatePersonDto } from "./dto/update-person.dto";

@Injectable()
export class PeoplesService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    const { socials, websites, closePersons, ...personData } = createPersonDto;

    return this.prisma.person.create({
      data: {
        ...personData,
        birthDate: personData.birthDate ? new Date(personData.birthDate) : null,
        socials: {
          create: socials || [],
        },
        websites: {
          create: websites || [],
        },
        closePersons: {
          create: closePersons || [],
        },
      },
      include: {
        socials: true,
        websites: true,
        closePersons: true,
      },
    });
  }

  async findAll() {
    const peoples = await this.prisma.person.findMany({
      include: {
        socials: true,
        websites: true,
        closePersons: true,
        photopacks: {
          select: { photoCount: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return peoples.map((p) => ({
      ...p,
      packCount: p.photopacks.length,
      photoCount: p.photopacks.reduce((acc, curr) => acc + curr.photoCount, 0),
    }));
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        socials: true,
        websites: true,
        closePersons: true,
        photopacks: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    const { socials, websites, closePersons, ...personData } = updatePersonDto;

    await this.findOne(id);

    return this.prisma.person.update({
      where: { id },
      data: {
        ...personData,
        birthDate: personData.birthDate
          ? new Date(personData.birthDate)
          : undefined,
        ...(socials && {
          socials: {
            deleteMany: {},
            create: socials,
          },
        }),
        ...(websites && {
          websites: {
            deleteMany: {},
            create: websites,
          },
        }),
        ...(closePersons && {
          closePersons: {
            deleteMany: {},
            create: closePersons,
          },
        }),
      },
      include: {
        socials: true,
        websites: true,
        closePersons: true,
      },
    });
  }

  async getPopularTags(search?: string) {
    const peoples = await this.prisma.person.findMany({
      select: { tags: true },
    });
    const counts: Record<string, number> = {};
    peoples.forEach((p) => {
      p.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    const type = await this.prisma.commonCodeType.findUnique({
      where: { code: "PRESET_TAGS" },
      include: { details: true },
    });

    const allTags = new Set<string>();
    if (type?.details) {
      type.details.forEach((d) => allTags.add(d.label));
    }
    Object.keys(counts).forEach((k) => allTags.add(k));

    let result = Array.from(allTags).map((tag) => ({
      tag,
      count: counts[tag] || 0,
    }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((r) => r.tag.toLowerCase().includes(lowerSearch));
    }

    result.sort((a, b) => b.count - a.count);

    return result.map((r) => r.tag);
  }

  async getRecentPhotopacks() {
    return this.prisma.photopack.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        person: {
          select: {
            fullName: true,
            nickname: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const res = await this.prisma.person.delete({
      where: { id },
    });

    const storagePath =
      process.env.STORAGE_PATH || "D:/peoplefy/infra/storage/peoples_dev";
    const personFolder = path.join(storagePath, id);
    if (fs.existsSync(personFolder)) {
      fs.rmSync(personFolder, { recursive: true, force: true });
    }

    return res;
  }

  async wipeAll() {
    await this.prisma.person.deleteMany({});

    const storagePath =
      process.env.STORAGE_PATH || "D:/peoplefy/infra/storage/peoples_dev";
    if (fs.existsSync(storagePath)) {
      fs.rmSync(storagePath, { recursive: true, force: true });
      fs.mkdirSync(storagePath, { recursive: true });
    }

    return {
      message:
        "All people data and physical files have been wiped successfully.",
    };
  }

  async findPhotopack(personId: string, photopackId: string) {
    const photopack = await this.prisma.photopack.findFirst({
      where: { id: photopackId, personId },
      include: {
        media: {
          orderBy: { createdAt: "asc" },
        },
        person: {
          select: {
            fullName: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!photopack) {
      throw new NotFoundException("Photopack not found");
    }

    return photopack;
  }

  async removePhotopack(personId: string, photopackId: string) {
    const photopack = await this.findPhotopack(personId, photopackId);

    await this.prisma.photopack.delete({
      where: { id: photopackId },
    });

    const storagePath =
      process.env.STORAGE_PATH ||
      path.join(__dirname, "..", "..", "..", "infra", "storage", "peoples_dev");
    const targetDir = path.join(
      storagePath,
      personId,
      "photopacks",
      photopackId,
    );
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    return { message: "Photopack deleted successfully" };
  }

  async createPhotopack(
    personId: string,
    body: any,
    files: Express.Multer.File[],
  ) {
    await this.findOne(personId);

    let photoCount = 0;
    let videoCount = 0;
    for (const file of files) {
      if (file.mimetype.startsWith("video")) videoCount++;
      else photoCount++;
    }

    const photopack = await this.prisma.photopack.create({
      data: {
        personId,
        title: body.title,
        platform: body.platform,
        externalUrl: body.externalUrl,
        photoCount,
        videoCount,
      },
    });

    const storagePath =
      process.env.STORAGE_PATH ||
      path.join(__dirname, "..", "..", "..", "infra", "storage", "peoples_dev");
    const targetDir = path.join(
      storagePath,
      personId,
      "photopacks",
      photopack.id,
    );

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let coverUrl: string | null = null;
    const mediaData = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const isCover = body[`isCover_${i}`] === "true";
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${i}${ext}`;
      const finalPath = path.join(targetDir, filename);

      fs.copyFileSync(file.path, finalPath);
      fs.unlinkSync(file.path);

      const fileUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${filename}`;

      let thumbUrl = fileUrl;
      if (file.mimetype.startsWith("video")) {
        const thumbFilename = `${Date.now()}-${i}-thumb.jpg`;
        const thumbPath = path.join(targetDir, thumbFilename);
        try {
          const { execSync } = require("child_process");
          execSync(
            `ffmpeg -ss 00:00:01 -i "${finalPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
            { stdio: "ignore" },
          );
          if (fs.existsSync(thumbPath)) {
            thumbUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${thumbFilename}`;
          }
        } catch (err) {}
      }

      if (isCover && !coverUrl) {
        coverUrl = thumbUrl;
      }

      mediaData.push({
        type: file.mimetype.startsWith("video") ? "video" : "image",
        url: fileUrl,
        isCover,
      });
    }

    if (!coverUrl && mediaData.length > 0 && mediaData[0]) {
      const firstMedia = mediaData[0];
      if (firstMedia.type === "video") {
        const firstVideoUrl = firstMedia.url;
        const storagePath =
          process.env.STORAGE_PATH ||
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "infra",
            "storage",
            "peoples_dev",
          );
        const relativePath = firstVideoUrl.replace(
          `${process.env.API_URL || "http://localhost:3001"}/storage/`,
          "",
        );
        const videoPath = path.join(storagePath, relativePath);
        const thumbFilename = `${Date.now()}-auto-thumb.jpg`;
        const thumbPath = path.join(targetDir, thumbFilename);
        try {
          const { execSync } = require("child_process");
          execSync(
            `ffmpeg -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
            { stdio: "ignore" },
          );
          if (fs.existsSync(thumbPath)) {
            coverUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${thumbFilename}`;
            firstMedia.isCover = true;
          }
        } catch (err) {}
      } else {
        coverUrl = firstMedia.url;
        firstMedia.isCover = true;
      }
    }

    await this.prisma.photopack.update({
      where: { id: photopack.id },
      data: {
        coverUrl,
        media: {
          create: mediaData,
        },
      },
    });

    return { message: "Photopack uploaded successfully", id: photopack.id };
  }

  async updatePhotopack(
    personId: string,
    photopackId: string,
    body: any,
    files: Express.Multer.File[],
  ) {
    const photopack = await this.findPhotopack(personId, photopackId);

    let existingMedia: any[] = [];
    try {
      if (body.existingMedia) {
        existingMedia = JSON.parse(body.existingMedia);
      }
    } catch (e) {}

    const keptMediaIds = existingMedia.map((m) => m.id);

    const mediaToDelete = photopack.media.filter(
      (m) => !keptMediaIds.includes(m.id),
    );
    for (const m of mediaToDelete) {
      try {
        const urlObj = new URL(m.url);
        const relativePath = decodeURI(urlObj.pathname).replace(
          "/storage/",
          "",
        );
        const storagePath =
          process.env.STORAGE_PATH ||
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "infra",
            "storage",
            "peoples_dev",
          );
        const filePath = path.join(storagePath, relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {}

      await this.prisma.media.delete({ where: { id: m.id } });
    }

    const storagePath =
      process.env.STORAGE_PATH ||
      path.join(__dirname, "..", "..", "..", "infra", "storage", "peoples_dev");
    const targetDir = path.join(
      storagePath,
      personId,
      "photopacks",
      photopack.id,
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let coverUrl: string | null = null;
    const newMediaData = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const isCover = body[`isCover_${i}`] === "true";
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${i}${ext}`;
      const finalPath = path.join(targetDir, filename);

      fs.copyFileSync(file.path, finalPath);
      fs.unlinkSync(file.path);

      const fileUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${filename}`;

      let thumbUrl = fileUrl;
      if (file.mimetype.startsWith("video")) {
        const thumbFilename = `${Date.now()}-${i}-thumb.jpg`;
        const thumbPath = path.join(targetDir, thumbFilename);
        try {
          const { execSync } = require("child_process");
          execSync(
            `ffmpeg -ss 00:00:01 -i "${finalPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
            { stdio: "ignore" },
          );
          if (fs.existsSync(thumbPath)) {
            thumbUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${thumbFilename}`;
          }
        } catch (err) {}
      }

      if (isCover && !coverUrl) {
        coverUrl = thumbUrl;
      }

      newMediaData.push({
        type: file.mimetype.startsWith("video") ? "video" : "image",
        url: fileUrl,
        isCover,
      });
    }

    if (newMediaData.length > 0) {
      await this.prisma.photopack.update({
        where: { id: photopack.id },
        data: {
          media: {
            create: newMediaData,
          },
        },
      });
    }

    for (const em of existingMedia) {
      await this.prisma.media.update({
        where: { id: em.id },
        data: { isCover: em.isCover },
      });
    }

    const updatedPhotopack = await this.findPhotopack(personId, photopackId);
    let finalCoverUrl: string | null = null;
    let coverMedia = updatedPhotopack.media.find((m) => m.isCover);
    if (coverMedia) {
      if (coverMedia.type === "video") {
        const storagePath =
          process.env.STORAGE_PATH ||
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "infra",
            "storage",
            "peoples_dev",
          );
        const videoUrl = coverMedia.url;
        const relativePath = videoUrl.replace(
          `${process.env.API_URL || "http://localhost:3001"}/storage/`,
          "",
        );
        const videoPath = path.join(storagePath, relativePath);
        const thumbFilename = `${Date.now()}-cover-thumb.jpg`;
        const thumbPath = path.join(targetDir, thumbFilename);
        try {
          const { execSync } = require("child_process");
          execSync(
            `ffmpeg -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
            { stdio: "ignore" },
          );
          if (fs.existsSync(thumbPath)) {
            finalCoverUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${thumbFilename}`;
          }
        } catch (err) {}
        if (!finalCoverUrl) {
          finalCoverUrl = coverUrl || coverMedia.url;
        }
      } else {
        finalCoverUrl = coverMedia.url;
      }
    } else {
      const firstMedia =
        updatedPhotopack.media.length > 0
          ? updatedPhotopack.media[0]
          : undefined;
      if (firstMedia) {
        if (firstMedia.type === "video") {
          const storagePath =
            process.env.STORAGE_PATH ||
            path.join(
              __dirname,
              "..",
              "..",
              "..",
              "infra",
              "storage",
              "peoples_dev",
            );
          const videoUrl = firstMedia.url;
          const relativePath = videoUrl.replace(
            `${process.env.API_URL || "http://localhost:3001"}/storage/`,
            "",
          );
          const videoPath = path.join(storagePath, relativePath);
          const thumbFilename = `${Date.now()}-auto-thumb.jpg`;
          const thumbPath = path.join(targetDir, thumbFilename);
          try {
            const { execSync } = require("child_process");
            execSync(
              `ffmpeg -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
              { stdio: "ignore" },
            );
            if (fs.existsSync(thumbPath)) {
              finalCoverUrl = `${process.env.API_URL || "http://localhost:3001"}/storage/${personId}/photopacks/${photopack.id}/${thumbFilename}`;
              await this.prisma.media.update({
                where: { id: firstMedia.id },
                data: { isCover: true },
              });
            }
          } catch (err) {}
          if (!finalCoverUrl) {
            finalCoverUrl = coverUrl || firstMedia.url;
          }
        } else {
          finalCoverUrl = firstMedia.url;
          await this.prisma.media.update({
            where: { id: firstMedia.id },
            data: { isCover: true },
          });
        }
      }
    }
    if (!finalCoverUrl) {
      finalCoverUrl = coverUrl;
    }

    await this.prisma.photopack.update({
      where: { id: photopack.id },
      data: {
        title: body.title,
        platform: body.platform,
        externalUrl: body.externalUrl,
        coverUrl: finalCoverUrl,
        photoCount: updatedPhotopack.media.filter((m) => m.type === "image")
          .length,
        videoCount: updatedPhotopack.media.filter((m) => m.type === "video")
          .length,
      },
    });

    return { message: "Photopack updated successfully", id: photopack.id };
  }
}
