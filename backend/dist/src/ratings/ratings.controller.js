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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const ratings_service_1 = require("./ratings.service");
let RatingsController = class RatingsController {
    constructor(service) {
        this.service = service;
    }
    rate(userId, profileId, contentId, rating, review) {
        return this.service.rate(userId, profileId, contentId, rating, review);
    }
    getForContent(contentId, page = 1, limit = 20) {
        return this.service.getForContent(contentId, +page, +limit);
    }
    getMyRating(profileId, contentId) {
        return this.service.getUserRating(profileId, contentId);
    }
    delete(id, userId) {
        return this.service.delete(id, userId);
    }
};
exports.RatingsController = RatingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Headers)('x-profile-id')),
    __param(2, (0, common_1.Body)('contentId')),
    __param(3, (0, common_1.Body)('rating')),
    __param(4, (0, common_1.Body)('review')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, String]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "rate", null);
__decorate([
    (0, common_1.Get)('content/:contentId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "getForContent", null);
__decorate([
    (0, common_1.Get)('my/:contentId'),
    __param(0, (0, common_1.Headers)('x-profile-id')),
    __param(1, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "getMyRating", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "delete", null);
exports.RatingsController = RatingsController = __decorate([
    (0, swagger_1.ApiTags)('Ratings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ratings'),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService])
], RatingsController);
//# sourceMappingURL=ratings.controller.js.map