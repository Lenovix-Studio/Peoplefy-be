import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { UrlTransformInterceptor } from "./common/interceptors/url-transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Peoplefy API")
    .setDescription("Dokumentasi REST API untuk platform Peoplefy")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new UrlTransformInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Peoplefy Backend running on: http://localhost:${port}`);
  console.log(`📑 Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
