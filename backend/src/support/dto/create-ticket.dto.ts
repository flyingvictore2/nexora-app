import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING   = 'BILLING',
  CONTENT   = 'CONTENT',
  ACCOUNT   = 'ACCOUNT',
  OTHER     = 'OTHER',
}

enum TicketStatus {
  OPEN        = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED    = 'RESOLVED',
  CLOSED      = 'CLOSED',
}

export class CreateTicketDto {
  @IsString()
  @MaxLength(200)
  subject: string;

  @IsString()
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: string;
}

export class ReplyTicketDto {
  @IsString()
  @MaxLength(5000)
  adminReply: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: string;
}
