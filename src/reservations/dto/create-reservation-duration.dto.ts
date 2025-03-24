import {
  IsNotEmpty,
  IsInt,
  IsString,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateReservationDurationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(30) // Minimum duration of 30 minutes
  durationMinutes: number;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
