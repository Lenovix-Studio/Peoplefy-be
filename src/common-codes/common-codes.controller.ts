import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CommonCodesService } from "./common-codes.service";
import { CreateCommonCodeTypeDto } from "./dto/create-type.dto";
import { UpdateCommonCodeTypeDto } from "./dto/update-type.dto";
import { CreateCommonCodeDetailDto } from "./dto/create-detail.dto";
import { UpdateCommonCodeDetailDto } from "./dto/update-detail.dto";

@ApiTags("Common Codes")
@Controller("common-codes")
export class CommonCodesController {
  constructor(private readonly commonCodesService: CommonCodesService) {}

  // API Get list type
  @Get("types")
  @ApiOperation({ summary: "Ambil semua list Code Type" })
  findAllTypes() {
    return this.commonCodesService.findAllTypes();
  }

  // API Get list detail of type
  @Get("types/:id")
  @ApiOperation({ summary: "Ambil satu Code Type beserta details" })
  findOneType(@Param("id") id: string) {
    return this.commonCodesService.findOneType(id);
  }

  // API Add type
  @Post("types")
  @ApiOperation({ summary: "Tambah Code Type baru" })
  @ApiResponse({ status: 201, description: "Type berhasil dibuat" })
  createType(@Body() dto: CreateCommonCodeTypeDto) {
    return this.commonCodesService.createType(dto);
  }

  // API Update type
  @Put("types/:id")
  @ApiOperation({ summary: "Update Code Type" })
  updateType(@Param("id") id: string, @Body() dto: UpdateCommonCodeTypeDto) {
    return this.commonCodesService.updateType(id, dto);
  }

  // API Delete type
  @Delete("types/:id")
  @ApiOperation({ summary: "Hapus Code Type beserta seluruh detail kodenya" })
  removeType(@Param("id") id: string) {
    return this.commonCodesService.removeType(id);
  }

  // API Get list type detail
  @Get("types/:typeId/details")
  @ApiOperation({ summary: "Ambil list detail code berdasarkan Type ID" })
  findDetailsByTypeId(@Param("typeId") typeId: string) {
    return this.commonCodesService.findDetailsByTypeId(typeId);
  }

  // API Get type detail
  @Get("details/:id")
  @ApiOperation({ summary: "Ambil satu detail code" })
  findOneDetail(@Param("id") id: string) {
    return this.commonCodesService.findOneDetail(id);
  }

  // API Add type detail
  @Post("types/:typeId/details")
  @ApiOperation({ summary: "Tambah detail code pada tipe tertentu" })
  createDetail(
    @Param("typeId") typeId: string,
    @Body() dto: CreateCommonCodeDetailDto,
  ) {
    return this.commonCodesService.createDetail(typeId, dto);
  }

  // API Update type detail
  @Put("details/:id")
  @ApiOperation({ summary: "Update spesifik detail code" })
  updateDetail(
    @Param("id") id: string,
    @Body() dto: UpdateCommonCodeDetailDto,
  ) {
    return this.commonCodesService.updateDetail(id, dto);
  }

  // API Detele type detail
  @Delete("details/:id")
  @ApiOperation({ summary: "Hapus spesifik detail code" })
  removeDetail(@Param("id") id: string) {
    return this.commonCodesService.removeDetail(id);
  }
}
