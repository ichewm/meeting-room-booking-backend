import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class SetRoleDto {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
