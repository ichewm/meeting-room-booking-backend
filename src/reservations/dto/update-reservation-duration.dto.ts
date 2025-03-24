import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDurationDto } from './create-reservation-duration.dto';

export class UpdateReservationDurationDto extends PartialType(
  CreateReservationDurationDto,
) {}
