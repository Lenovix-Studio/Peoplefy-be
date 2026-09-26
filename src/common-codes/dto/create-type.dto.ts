import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCommonCodeTypeDto {
  @ApiProperty({ example: "GENDER", description: "Kode tipe unik" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: "Jenis Kelamin", description: "Nama label tipe" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: "Kategori pilihan jenis kelamin karyawan" })
  @IsString()
  @IsOptional()
  description?: string;
}
