import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "src/module/auth/auth.service";

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({ usernameField: 'email' }); // Chỉ định dùng email thay cho username mặc định
//   }

//   async validate(email: string, pass: string): Promise<any> {
//     const user = await this.authService.validateUser(email, pass);
//     if (!user) {
//       throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
//     }
//     return user;
//   }
// }
