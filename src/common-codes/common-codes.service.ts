import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommonCodeTypeDto } from "./dto/create-type.dto";
import { UpdateCommonCodeTypeDto } from "./dto/update-type.dto";
import { CreateCommonCodeDetailDto } from "./dto/create-detail.dto";
import { UpdateCommonCodeDetailDto } from "./dto/update-detail.dto";

@Injectable()
export class CommonCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTypes() {
    return this.prisma.commonCodeType.findMany({
      orderBy: { code: "asc" },
    });
  }

  async findOneType(id: string) {
    const type = await this.prisma.commonCodeType.findUnique({
      where: { id },
      include: { details: true },
    });
    if (!type) {
      throw new NotFoundException(`Type with ID "${id}" not found.`);
    }
    return type;
  }

  async createType(dto: CreateCommonCodeTypeDto) {
    const existing = await this.prisma.commonCodeType.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Type with code "${dto.code}" already exists.`,
      );
    }

    return this.prisma.commonCodeType.create({
      data: dto,
    });
  }

  async updateType(id: string, dto: UpdateCommonCodeTypeDto) {
    await this.findOneType(id);

    if (dto.code) {
      const existing = await this.prisma.commonCodeType.findUnique({
        where: { code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Type with code "${dto.code}" already exists.`,
        );
      }
    }

    return this.prisma.commonCodeType.update({
      where: { id },
      data: dto,
    });
  }

  async removeType(id: string) {
    await this.findOneType(id); // Ensure exists
    return this.prisma.commonCodeType.delete({
      where: { id },
    });
  }

  async findDetailsByTypeId(typeId: string) {
    return this.prisma.commonCodeDetail.findMany({
      where: { typeId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findOneDetail(id: string) {
    const detail = await this.prisma.commonCodeDetail.findUnique({
      where: { id },
    });
    if (!detail) {
      throw new NotFoundException(`Detail with ID "${id}" not found.`);
    }
    return detail;
  }

  async createDetail(typeId: string, dto: CreateCommonCodeDetailDto) {
    const type = await this.prisma.commonCodeType.findUnique({
      where: { id: typeId },
    });
    if (!type) {
      throw new NotFoundException(
        `Common Code Type with ID "${typeId}" not found.`,
      );
    }

    return this.prisma.commonCodeDetail.create({
      data: {
        ...dto,
        typeId,
      },
    });
  }

  async updateDetail(id: string, dto: UpdateCommonCodeDetailDto) {
    await this.findOneDetail(id);
    return this.prisma.commonCodeDetail.update({
      where: { id },
      data: dto,
    });
  }

  async removeDetail(id: string) {
    await this.findOneDetail(id);
    return this.prisma.commonCodeDetail.delete({
      where: { id },
    });
  }
}
