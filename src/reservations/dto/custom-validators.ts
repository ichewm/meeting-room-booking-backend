// 自定义验证器
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStartBeforeEnd', async: false })
export class IsStartBeforeEnd implements ValidatorConstraintInterface {
  validate(endTime: string, args: ValidationArguments) {
    const startTime = (args.object as any)[args.constraints[0]];
    return new Date(startTime) < new Date(endTime);
  }
}
