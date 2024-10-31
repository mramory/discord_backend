import { ConflictException, Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from "bcrypt"
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService, 
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async register(dto: RegisterUserDto, res: Response) {
        const {email, password, name, birthday, viewName} = dto
        const existUser = await this.userService.findOneByEmail({email})
        if(existUser) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashPassword,
                name,
                birthday,
                viewName
            }
        })
        const tokens = this.getTokens(user)
        res.cookie('RefreshToken', tokens.refreshToken)
        res.cookie('AccessToken', tokens.accessToken)
        res.cookie('currentUserId', user.id)
        res.json({
            accessToken: tokens.accessToken,
            name: user.name,
            email: user.email,
            role: user.role,
            viewName: user.viewName,
            img: user.img
        })
    }


    async login(dto: LoginUserDto, res: Response) {
        const {email, password} = dto
        const user = await this.userService.findOneByEmail({email})
        if(user){
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const tokens = this.getTokens(user)
                res.cookie('RefreshToken', tokens.refreshToken)
                res.cookie('AccessToken', tokens.accessToken)
                res.cookie('currentUserId', user.id)
                res.json({
                    accessToken: tokens.accessToken,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    viewName: user.viewName,
                    id: user.id,
                    img: user.img
                })
            };
            return new ConflictException('Invalid Credentials!');
        }
        return new ConflictException('Invalid Credentials!')
    }

    getRefreshToken(id: number) {
        return this.jwtService.sign({
            userId: id
        }, {expiresIn: "7d"})
    }

    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies['RefreshToken']
        if(!refreshToken) {
            res.clearCookie("RefreshToken")
            throw new HttpException("Refresh Token Not Provided", HttpStatus.NOT_ACCEPTABLE)
        }
        const payload = this.jwtService.verify(refreshToken, {secret: process.env.JWT_SECRET})
        if(!payload) {
            res.clearCookie("RefreshToken")
            throw new HttpException("Refresh Token Excided", HttpStatus.NOT_ACCEPTABLE)
        }
        const user = await this.userService.findOneById({id: payload["userId"]})
        if(!user) {
            throw new HttpException("User Not Found", HttpStatus.NOT_FOUND)
        }
        const newToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            viewName: user.viewName,
            role: user.role,
            img: user.img
        })
        res.json({
            accessToken: newToken,
            name: user.name,
            email: user.email,
            role: user.role,
            viewName: user.viewName,
            img: user.img
        })
    }

    async logout(res: Response) {
        res.clearCookie("RefreshToken")
        throw new HttpException("Loged Out", HttpStatus.OK)
    }

    checkIsAuth(req: Request) {
        const user = req.user
        if(!user) throw new HttpException("Not Logged In", HttpStatus.UNAUTHORIZED)
        else return user
    }

    getTokens(user: JwtPayload) {
        const accessToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            viewName: user.viewName,
            role: user.role,
            img: user.img
        })
        const refreshToken = this.getRefreshToken(user.id)
        return {accessToken, refreshToken}
    }
}
