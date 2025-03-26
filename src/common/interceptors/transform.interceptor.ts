import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Response<T> {
  data: T;
  status: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);
  private readonly sensitiveFields: string[];

  constructor(private configService: ConfigService) {
    this.sensitiveFields = configService
      .get<string>('SENSITIVE_FIELDS', 'password,salt,token')
      .split(',');
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        let serializedData = data;

        if (data && typeof data === 'object') {
          try {
            serializedData = this.serialize(data);
          } catch (error) {
            this.logger.error('序列化响应数据失败', error.stack);
            return {
              data: null,
              status: 'error',
              timestamp: new Date().toISOString(),
            };
          }
        }

        return {
          data: serializedData,
          status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private serialize(data: any, depth = 0, maxDepth = 5): any {
    if (depth >= maxDepth) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.serialize(item, depth + 1, maxDepth));
    } else if (
      data &&
      typeof data === 'object' &&
      data.constructor !== Object
    ) {
      const plainObject = Object.assign({}, data);
      this.sensitiveFields.forEach((field) => {
        if (field in plainObject) {
          delete plainObject[field];
        }
      });
      return plainObject;
    }
    return data;
  }
}
