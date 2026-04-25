import { ConfigService } from '@nestjs/config';
export declare class UploadsService {
    private config;
    private uploadDir;
    constructor(config: ConfigService);
    uploadImage(file: Express.Multer.File, type: 'poster' | 'banner' | 'avatar'): Promise<{
        url: string;
    }>;
    getFilePath(filename: string): string | null;
}
