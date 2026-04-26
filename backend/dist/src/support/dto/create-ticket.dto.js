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
exports.UpdateTicketStatusDto = exports.ReplyTicketDto = exports.CreateTicketDto = void 0;
const class_validator_1 = require("class-validator");
var TicketCategory;
(function (TicketCategory) {
    TicketCategory["TECHNICAL"] = "TECHNICAL";
    TicketCategory["BILLING"] = "BILLING";
    TicketCategory["CONTENT"] = "CONTENT";
    TicketCategory["ACCOUNT"] = "ACCOUNT";
    TicketCategory["OTHER"] = "OTHER";
})(TicketCategory || (TicketCategory = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (TicketStatus = {}));
class CreateTicketDto {
}
exports.CreateTicketDto = CreateTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TicketCategory),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "category", void 0);
class ReplyTicketDto {
}
exports.ReplyTicketDto = ReplyTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], ReplyTicketDto.prototype, "adminReply", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TicketStatus),
    __metadata("design:type", String)
], ReplyTicketDto.prototype, "status", void 0);
class UpdateTicketStatusDto {
}
exports.UpdateTicketStatusDto = UpdateTicketStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(TicketStatus),
    __metadata("design:type", String)
], UpdateTicketStatusDto.prototype, "status", void 0);
//# sourceMappingURL=create-ticket.dto.js.map