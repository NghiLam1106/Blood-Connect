import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { HttpRequestStatus } from '../../enums/httpRequest.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException(
        {
          status: HttpRequestStatus.UNAUTHORIZED,
          message: 'Token không được cung cấp!',
          error: 'Unauthorized',
        },
        HttpRequestStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      request['user'] = payload;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpRequestStatus.UNAUTHORIZED,
          message: 'Token không hợp lệ hoặc đã hết hạn!',
          error: 'Unauthorized',
        },
        HttpRequestStatus.UNAUTHORIZED,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
