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
import { Throttle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { unlink } from 'fs/promises';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { FileKind, matchesSignature } from '../common/utils/file-signature';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const DOCUMENT_TYPES: Record<string, string> = { ...IMAGE_TYPES, 'application/pdf': '.pdf' };
const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const ALLOWED_ORIGINAL_EXT: Record<string, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.webp'],
  document: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
  video: ['.mp4', '.webm', '.mov'],
};

// The stored name and extension come from the validated MIME type, never from the client's file name,
// so an uploaded "image" can't be saved as .html, .php or .svg.
const storageFor = (types: Record<string, string>) =>
  diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${types[file.mimetype] ?? ''}`);
    },
  });

const filterFor = (kind: FileKind, types: Record<string, string>) =>
  (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, !!types[file.mimetype] && ALLOWED_ORIGINAL_EXT[kind].includes(ext));
  };

/** Drops every file from a request if any of them isn't what its type claims to be. */
const verifyOrDiscard = async (files: Express.Multer.File[] | undefined, kind: FileKind, emptyMessage: string) => {
  if (!files || files.length === 0) throw new BadRequestException(emptyMessage);
  const results = await Promise.all(files.map((f) => matchesSignature(f.path, kind).catch(() => false)));
  if (results.every(Boolean)) return files.map((f) => `/uploads/${f.filename}`);
  await Promise.all(files.map((f) => unlink(f.path).catch(() => undefined)));
  throw new BadRequestException('One or more files are not valid for the type they claim to be.');
};

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post('images')
  @Throttle({ default: { limit: 30, ttl: 60 * 60 * 1000 } })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: storageFor(IMAGE_TYPES),
      fileFilter: filterFor('image', IMAGE_TYPES),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await verifyOrDiscard(files, 'image', 'No valid image files received. Allowed types: JPG, PNG, WEBP.');
    return { urls };
  }

  @Post('documents')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60 * 60 * 1000 } })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: storageFor(DOCUMENT_TYPES),
      fileFilter: filterFor('document', DOCUMENT_TYPES),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await verifyOrDiscard(files, 'document', 'No valid files received. Allowed types: PDF, JPG, PNG, WEBP.');
    return { urls };
  }

  @Post('video')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60 * 60 * 1000 } })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage: storageFor(VIDEO_TYPES),
      fileFilter: filterFor('video', VIDEO_TYPES),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async uploadVideo(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await verifyOrDiscard(files, 'video', 'No valid video file received. Allowed types: MP4, WebM, MOV.');
    return { urls };
  }
}
