import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post('images')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage,
      fileFilter: (_req, file, cb) => {
        // Silently reject — controller validates below
        cb(null, !!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/));
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No valid image files received. Allowed types: JPG, PNG, WEBP.');
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return { urls };
  }

  @Post('documents')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      fileFilter: (_req, file, cb) => {
        cb(null, !!file.mimetype.match(/\/(jpg|jpeg|png|webp|pdf)$/) || file.mimetype === 'application/pdf');
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No valid files received. Allowed types: PDF, JPG, PNG.');
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return { urls };
  }

  @Post('video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage,
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype.startsWith('video/'));
      },
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  uploadVideo(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No valid video file received. Allowed types: MP4, WebM, MOV.');
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return { urls };
  }
}
