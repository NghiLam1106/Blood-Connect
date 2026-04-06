import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: 'YOUR_SECRET_KEY', // Nên để trong file .env
//     });
//   }

//   async validate(payload: any) {
//     // Trả về dữ liệu sẽ được gán vào req.user
//     return { userId: payload.sub, email: payload.email, role: payload.role };
//   }
// }
