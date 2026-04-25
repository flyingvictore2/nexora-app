import { Response } from 'express';
import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private service;
    constructor(service: UploadsService);
    uploadImage(type: 'poster' | 'banner' | 'avatar', file: Express.Multer.File): Promise<{
        url: string;
    }>;
    serveFile(filename: string, res: Response): Response<any, Record<string, any>> | undefined;
}
