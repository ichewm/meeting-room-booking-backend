import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
  data: T;
  status: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // 使用管道处理序列化
    return next.handle().pipe(
      map((data) => {
        // 创建一个 ClassSerializerInterceptor 实例
        const serializer = new ClassSerializerInterceptor(this.reflector);

        // 对返回数据进行序列化处理
        if (data && typeof data === 'object') {
          // 如果是一个对象或对象数组，尝试序列化
          try {
            // 简单处理：让 ClassSerializerInterceptor 的逻辑在全局拦截器中生效
            // 实际应用中可能需要更复杂的处理
            data = this.serialize(data);
          } catch (error) {
            // 如果序列化失败，使用原始数据
            console.warn('Failed to serialize response data:', error);
          }
        }

        return {
          data,
          status: 'success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  // 辅助方法：处理对象序列化
  private serialize(data: any): any {
    if (Array.isArray(data)) {
      // 处理数组
      return data.map((item) => this.serialize(item));
    } else if (
      data &&
      typeof data === 'object' &&
      data.constructor !== Object
    ) {
      // 对于类实例（非普通对象），应用 @Exclude 等装饰器
      const plainObject = Object.assign({}, data);

      // 移除标记为 @Exclude() 的属性
      // 这里使用简化逻辑，实际中可能需要反射或其它机制
      if ('password' in plainObject) {
        delete plainObject.password;
      }

      return plainObject;
    }

    return data;
  }
}
