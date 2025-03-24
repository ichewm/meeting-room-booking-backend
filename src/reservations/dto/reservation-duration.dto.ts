import {
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateReservationDurationDto {
  @IsNumber()
  @Min(15) // Minimum duration of 15 minutes
  durationMinutes: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateReservationDurationDto {
  @IsNumber()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
