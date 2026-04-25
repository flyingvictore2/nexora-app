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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const analytics_service_1 = require("../analytics/analytics.service");
const users_service_1 = require("../users/users.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const payments_service_1 = require("../payments/payments.service");
let AdminController = class AdminController {
    constructor(analytics, users, subscriptions, payments) {
        this.analytics = analytics;
        this.users = users;
        this.subscriptions = subscriptions;
        this.payments = payments;
    }
    async getDashboard() {
        const [metrics, mostWatched, userGrowth, revenue, subscriptionDist] = await Promise.all([
            this.analytics.getDashboardMetrics(),
            this.analytics.getMostWatched(10),
            this.analytics.getUserGrowth(6),
            this.analytics.getRevenueByMonth(6),
            this.analytics.getSubscriptionDistribution(),
        ]);
        return { metrics, mostWatched, userGrowth, revenue, subscriptionDist };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        users_service_1.UsersService,
        subscriptions_service_1.SubscriptionsService,
        payments_service_1.PaymentsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map