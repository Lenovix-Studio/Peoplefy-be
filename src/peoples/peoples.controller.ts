import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  Query,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { PeoplesService } from "./peoples.service";
import { CreatePersonDto } from "./dto/create-person.dto";
import { UpdatePersonDto } from "./dto/update-person.dto";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";

@ApiTags("Peoples")
@Controller("peoples")
export class PeoplesController {
  constructor(private readonly peoplesService: PeoplesService) {}

  // API Add new people
  @Post()
  @ApiOperation({ summary: "Create a new person" })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.peoplesService.create(createPersonDto);
  }

  // API Upload photo profile and cover
  @Post(":id/upload")
  @ApiOperation({ summary: "Upload avatar and cover" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "avatar", maxCount: 1 },
        { name: "cover", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const id = req.params.id as string;
            const storagePath =
              process.env.STORAGE_PATH ||
              "D:/peoplefy/infra/storage/peoples_dev";
            const dest = path.join(storagePath, id);
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
          },
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = `${file.fieldname}-${Date.now()}${ext}`;
            cb(null, name);
          },
        }),
      },
    ),
  )
  async uploadFiles(
    @Param("id") id: string,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const updates: any = {};
    if (files.avatar?.[0]) {
      updates.avatarUrl = `/storage/${id}/${files.avatar[0].filename}`;
    }
    if (files.cover?.[0]) {
      updates.coverUrl = `/storage/${id}/${files.cover[0].filename}`;
    }

    if (Object.keys(updates).length > 0) {
      await this.peoplesService.update(id, updates as UpdatePersonDto);
    }

    return { message: "Files uploaded successfully", urls: updates };
  }

  // API Get all peple
  @Get()
  @ApiOperation({ summary: "Get all peoples" })
  findAll() {
    return this.peoplesService.findAll();
  }

  // API Get popilar tags
  @Get("tags/popular")
  @ApiOperation({ summary: "Get sorted popular tags with optional search" })
  getPopularTags(@Query("search") search?: string) {
    return this.peoplesService.getPopularTags(search);
  }

  // API Get All photopack
  @Get("content/recent")
  @ApiOperation({ summary: "Get recent photopacks globally" })
  getRecentPhotopacks() {
    return this.peoplesService.getRecentPhotopacks();
  }

  // API Get people data
  @Get(":id")
  @ApiOperation({ summary: "Get a person by id" })
  findOne(@Param("id") id: string) {
    return this.peoplesService.findOne(id);
  }

  // API Update people
  @Put(":id")
  @ApiOperation({ summary: "Update a person" })
  update(@Param("id") id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.peoplesService.update(id, updatePersonDto);
  }

  // API Delete all file pgysical
  @Delete("wipe/all")
  @ApiOperation({ summary: "Wipe all people data and physical files" })
  wipeAll() {
    return this.peoplesService.wipeAll();
  }

  // API Delete people
  @Delete(":id")
  @ApiOperation({ summary: "Delete a person" })
  remove(@Param("id") id: string) {
    return this.peoplesService.remove(id);
  }

  // API Get photopack
  @Get(":id/photopacks/:photopackId")
  @ApiOperation({ summary: "Get a specific photopack" })
  getPhotopack(
    @Param("id") id: string,
    @Param("photopackId") photopackId: string,
  ) {
    return this.peoplesService.findPhotopack(id, photopackId);
  }

  // API Delete photopack
  @Delete(":id/photopacks/:photopackId")
  @ApiOperation({ summary: "Delete a specific photopack" })
  removePhotopack(
    @Param("id") id: string,
    @Param("photopackId") photopackId: string,
  ) {
    return this.peoplesService.removePhotopack(id, photopackId);
  }

  // API Add photopack
  @Post(":id/photopacks")
  @UseInterceptors(
    FilesInterceptor("media", undefined, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempPath = path.join(os.tmpdir(), "peoplefy_uploads");
          if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
          }
          cb(null, tempPath);
        },
        filename: (req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async createPhotopack(
    @Param("id") id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.peoplesService.createPhotopack(id, body, files);
  }

  // API Update photopack
  @Put(":id/photopacks/:photopackId")
  @UseInterceptors(
    FilesInterceptor("media", 100, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempPath = path.join(os.tmpdir(), "peoplefy_uploads");
          if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
          }
          cb(null, tempPath);
        },
        filename: (req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async updatePhotopack(
    @Param("id") id: string,
    @Param("photopackId") photopackId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.peoplesService.updatePhotopack(
      id,
      photopackId,
      body,
      files || [],
    );
  }
}
