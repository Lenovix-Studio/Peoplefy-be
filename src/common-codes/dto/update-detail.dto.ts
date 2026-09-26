import { PartialType } from "@nestjs/swagger";
import { CreateCommonCodeDetailDto } from "./create-detail.dto";

export class UpdateCommonCodeDetailDto extends PartialType(
  CreateCommonCodeDetailDto,
) {}
