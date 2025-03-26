import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  MaxLength,
  Validate,
} from 'class-validator';
import { IsStartBeforeEnd } from './custom-validators';

export class CreateReservationDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(100, { message: '标题长度不能超过100个字符' })
  title: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;

  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDateString({}, { message: '开始时间必须是有效的 ISO 日期字符串' })
  startTime: string;

  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDateString({}, { message: '结束时间必须是有效的 ISO 日期字符串' })
  @Validate(IsStartBeforeEnd, ['startTime'], {
    message: '结束时间必须晚于开始时间',
  })
  endTime: string;

  @IsNotEmpty({ message: '会议室 ID 不能为空' })
  @IsNumber({}, { message: '会议室 ID 必须是数字' })
  roomId: number;
}
