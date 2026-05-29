// import { Inject, Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { ExtractJwt, Strategy } from "passport-jwt";
// import type { ConfigType } from "@nestjs/config";
// import jwtConfig from "../config/jwt.config";
// import { ActiveUser } from "../interface/active-user.interface";
// import { REQUEST_USER_KEY } from "../constants/auth.constants";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     @Inject(jwtConfig.KEY)
//     private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: jwtConfiguration.secret,
//       ignoreExpiration: false,
//     });
//   }

//   async validate(payload: ActiveUser) {
//     return payload;
//   }
// }
