import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonCodesModule } from "./common-codes/common-codes.module";
import { PeoplesModule } from "./peoples/peoples.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rootPath =
          configService.get<string>("STORAGE_PATH") ||
          "D:/peoplefy/infra/storage/peoples_dev";
        return [
          {
            rootPath,
            serveRoot: "/storage",
          },
        ];
      },
    }),
    PrismaModule,
    CommonCodesModule,
    PeoplesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
