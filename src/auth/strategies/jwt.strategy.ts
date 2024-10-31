import { JwtPayload } from '../interfaces';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT, ExtractJwt.fromAuthHeaderAsBearerToken()]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    private static extractJWT(req: Request): string | null {
        if (
          req.cookies &&
          req.cookies["AccessToken"]?.length > 0
        ) {
          return req.cookies["AccessToken"];
        }
        return null;
      }

    async validate(payload: JwtPayload) {
        const user: User = await this.userService.findOneById({id: payload.id}).catch((err) => {
            return null;
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return payload;
    }
}