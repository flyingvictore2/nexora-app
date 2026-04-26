import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

enum RequestType {
  MOVIE  = 'MOVIE',
  SERIES = 'SERIES',
  ANIME  = 'ANIME',
  OTHER  = 'OTHER',
}

export class CreateRequestDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(RequestType)
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateRequestStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
