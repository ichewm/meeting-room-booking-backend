import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class SetRoleDto {
  @IsNotEmpty({ message: '角色不能为空' })
  @IsEnum(Role, { message: '角色必须是有效的枚举值' })
  role: Role;
}
