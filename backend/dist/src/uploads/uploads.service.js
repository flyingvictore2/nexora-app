"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const uuid_1 = require("uuid");
let UploadsService = class UploadsService {
    constructor(config) {
        this.config = config;
        this.uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadImage(file, type) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
        }
        const dimensions = {
            poster: { width: 500, height: 750 },
            banner: { width: 1920, height: 1080 },
            avatar: { width: 200, height: 200 },
        };
        const { width, height } = dimensions[type];
        const filename = `${type}_${(0, uuid_1.v4)()}.webp`;
        const filepath = path.join(this.uploadDir, filename);
        await sharp(file.buffer)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .webp({ quality: 85 })
            .toFile(filepath);
        const baseUrl = this.config.get('BACKEND_URL', 'http://localhost:4000');
        return { url: `${baseUrl}/api/v1/uploads/${filename}` };
    }
    getFilePath(filename) {
        const filepath = path.join(this.uploadDir, filename);
        if (!fs.existsSync(filepath))
            return null;
        return filepath;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map