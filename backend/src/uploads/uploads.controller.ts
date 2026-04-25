import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { Public } from '../common/decorators/public.decorator';
import * as path from 'path';

@ApiTags('Uploads')
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private service: UploadsService) {}

  @Post('image/:type')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImage(
    @Param('type') type: 'poster' | 'banner' | 'avatar',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!['poster', 'banner', 'avatar'].includes(type)) {
      throw new BadRequestException('Invalid upload type');
    }
    return this.service.uploadImage(file, type);
  }

  @Get(':filename')
  @Public()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // Prevent path traversal
    const safe = path.basename(filename);
    const filepath = this.service.getFilePath(safe);
    if (!filepath) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(filepath);
  }
}
