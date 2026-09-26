import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class SocialDto {
  @IsString() @IsNotEmpty() platform!: string;
  @IsString() @IsNotEmpty() url!: string;
}

export class WebsiteDto {
  @IsString() @IsNotEmpty() platform!: string;
  @IsString() @IsNotEmpty() url!: string;
}

export class ClosePersonDto {
  @IsString() @IsNotEmpty() relation!: string;
  @IsString() @IsNotEmpty() platform!: string;
  @IsString() @IsNotEmpty() url!: string;
}

export class CreatePersonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nickname?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  birthPlace?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ type: [SocialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialDto)
  @IsOptional()
  socials?: SocialDto[];

  @ApiPropertyOptional({ type: [WebsiteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteDto)
  @IsOptional()
  websites?: WebsiteDto[];

  @ApiPropertyOptional({ type: [ClosePersonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClosePersonDto)
  @IsOptional()
  closePersons?: ClosePersonDto[];
}
