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
exports.WatchHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const watch_history_service_1 = require("./watch-history.service");
let WatchHistoryController = class WatchHistoryController {
    constructor(service) {
        this.service = service;
    }
    updateProgress(userId, dto) {
        return this.service.updateProgress(userId, dto);
    }
    getHistory(profileId, page = 1, limit = 20) {
        return this.service.getHistory(profileId, +page, +limit);
    }
    getContinueWatching(profileId) {
        return this.service.getContinueWatching(profileId);
    }
    getProgress(profileId, contentId, episodeId) {
        return this.service.getProgress(profileId, contentId, episodeId);
    }
    deleteItem(id, userId) {
        return this.service.deleteHistoryItem(id, userId);
    }
    clearHistory(profileId, userId) {
        return this.service.clearHistory(profileId, userId);
    }
};
exports.WatchHistoryController = WatchHistoryController;
__decorate([
    (0, common_1.Post)('progress'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, watch_history_service_1.UpdateProgressDto]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-profile-id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('continue-watching'),
    __param(0, (0, common_1.Headers)('x-profile-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "getContinueWatching", null);
__decorate([
    (0, common_1.Get)('progress/:contentId'),
    __param(0, (0, common_1.Headers)('x-profile-id')),
    __param(1, (0, common_1.Param)('contentId')),
    __param(2, (0, common_1.Query)('episodeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-profile-id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "clearHistory", null);
exports.WatchHistoryController = WatchHistoryController = __decorate([
    (0, swagger_1.ApiTags)('Watch History'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('watch-history'),
    __metadata("design:paramtypes", [watch_history_service_1.WatchHistoryService])
], WatchHistoryController);
//# sourceMappingURL=watch-history.controller.js.map