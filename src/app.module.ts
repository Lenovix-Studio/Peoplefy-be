import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonCodesModule } from "./common-codes/common-codes.module";

@Module({
  imports: [PrismaModule, CommonCodesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
