import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private uploadDir: string;

  constructor(private config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, type: 'poster' | 'banner' | 'avatar') {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    const dimensions = {
      poster: { width: 500, height: 750 },
      banner: { width: 1920, height: 1080 },
      avatar: { width: 200, height: 200 },
    };

    const { width, height } = dimensions[type];
    const filename = `${type}_${uuidv4()}.webp`;
    const filepath = path.join(this.uploadDir, filename);

    await sharp(file.buffer)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(filepath);

    const baseUrl = this.config.get('BACKEND_URL', 'http://localhost:4000');
    return { url: `${baseUrl}/api/v1/uploads/${filename}` };
  }

  getFilePath(filename: string) {
    const filepath = path.join(this.uploadDir, filename);
    if (!fs.existsSync(filepath)) return null;
    return filepath;
  }
}
