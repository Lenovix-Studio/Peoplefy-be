import { PartialType } from "@nestjs/swagger";
import { CreateCommonCodeTypeDto } from "./create-type.dto";

export class UpdateCommonCodeTypeDto extends PartialType(
  CreateCommonCodeTypeDto,
) {}
