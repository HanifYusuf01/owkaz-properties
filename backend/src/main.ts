import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { extname, join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // One reverse-proxy hop (LiteSpeed / Docker): use the real client IP for rate limiting.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const INLINE_UPLOADS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.webm', '.mov']);
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    dotfiles: 'deny',
    index: false,
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      // Anything that isn't a known media type (e.g. files uploaded before validation existed) is only ever a download.
      if (!INLINE_UPLOADS.has(extname(path).toLowerCase())) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: [
      'https://owkaz.properties.neonwave.com.ng',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  // API docs are opt-in (SWAGGER_ENABLED=true) so they aren't public in production.
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Owkaz API')
      .setDescription('Owkaz Real Estate Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}
bootstrap();
