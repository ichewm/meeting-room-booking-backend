import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMeetingRoomDto {
  @IsNotEmpty({ message: '会议室名称不能为空' })
  @IsString({ message: '会议室名称必须是字符串' })
  @MaxLength(50, { message: '会议室名称长度不能超过50个字符' })
  @Matches(/^[a-zA-Z0-9\u4e00-\u9fa5-_ ]+$/, {
    message: '会议室名称只能包含字母、数字、中文、空格、-和_',
  })
  name: string;

  @IsNotEmpty({ message: '容量不能为空' })
  @IsNumber({}, { message: '容量必须是数字' })
  @Min(1, { message: '容量必须大于等于1' })
  capacity: number;

  @IsNotEmpty({ message: '位置不能为空' })
  @IsString({ message: '位置必须是字符串' })
  @MaxLength(100, { message: '位置长度不能超过100个字符' })
  location: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;
}
