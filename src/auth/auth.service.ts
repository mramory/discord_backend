import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { RestorePassDto } from './dto/restorePass.dto';
import { FilePath, UserJson } from './dto/userJson.dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  public code: string;

  async register(dto: RegisterUserDto, res: Response) {
    const { email, password, name, birthday, viewName } = dto;
    const existUser = await this.userService.findOneByEmail({ email });
    if (existUser) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
        birthday,
        viewName,
      },
    });
    const tokens = this.getTokens(user);
    res.cookie('RefreshToken', tokens.refreshToken);
    res.cookie('AccessToken', tokens.accessToken);
    res.cookie('currentUserId', user.id);
    res.json({
      accessToken: tokens.accessToken,
      name: user.name,
      email: user.email,
      role: user.role,
      viewName: user.viewName,
      img: user.img,
    });
  }

  async login(dto: LoginUserDto, res: Response) {
    const { email, password } = dto;
    const user = await this.userService.findOneByEmail({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const tokens = this.getTokens(user);
        res.cookie('RefreshToken', tokens.refreshToken);
        res.cookie('AccessToken', tokens.accessToken);
        res.cookie('currentUserId', user.id);
        res.json({
          accessToken: tokens.accessToken,
          name: user.name,
          email: user.email,
          role: user.role,
          viewName: user.viewName,
          id: user.id,
          img: user.img,
        });
      }
      return new ConflictException('Invalid Credentials!');
    }
    return new ConflictException('Invalid Credentials!');
  }

  getRefreshToken(id: number) {
    return this.jwtService.sign(
      {
        userId: id,
      },
      { expiresIn: '7d' },
    );
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['RefreshToken'];
    if (!refreshToken) {
      res.clearCookie('RefreshToken');
      throw new HttpException(
        'Refresh Token Not Provided',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET,
    });
    if (!payload) {
      res.clearCookie('RefreshToken');
      throw new HttpException(
        'Refresh Token Excided',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const user = await this.userService.findOneById({ id: payload['userId'] });
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    const newToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      viewName: user.viewName,
      role: user.role,
      img: user.img,
    });
    res.json({
      accessToken: newToken,
      name: user.name,
      email: user.email,
      role: user.role,
      viewName: user.viewName,
      img: user.img,
    });
  }

  async logout(res: Response) {
    res.clearCookie('RefreshToken');
    throw new HttpException('Loged Out', HttpStatus.OK);
  }

  checkIsAuth(req: Request) {
    console.log(req.user);
    const user = req.user;
    if (!user)
      throw new HttpException('Not Logged In', HttpStatus.UNAUTHORIZED);
    else return user;
  }

  getTokens(user: JwtPayload) {
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      viewName: user.viewName,
      role: user.role,
      img: user.img,
    });
    const refreshToken = this.getRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  async sendEmail(data: RestorePassDto) {
    const code = Math.floor(Math.random() * 1000);
    this.code = String(code);
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'mramor91932765@gmail.com',
        pass: 'xgdl cffh lihh btfh',
      },
    });
    await transporter.sendMail({
      from: 'mramor91932765@gmail.com',
      to: data.email,
      subject: 'Сброс пароля',
      text: `Код для сброса пароля`,
      html: `<p>${code}</p>`,
    });
    return true;
  }

  async restorePass(data: RestorePassDto) {
    if (data.code !== this.code) {
      return false;
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(data.pass, salt);

    await this.prisma.user.update({
      where: {
        email: data.email,
      },
      data: {
        password: hashPassword,
      },
    });
    return true;
  }

  async loadUsersJson({ filePath }: FilePath) {
    const resData = [];
    const FILE_PATH = `C:\Users\\mramo\\Downloads\\${filePath}`;

    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    const jsonData = JSON.parse(fileContent);

    for (const user of jsonData) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(user.password, salt);

      resData.push({
        name: user.name,
        email: user.email,
        password: hashPassword,
        viewName: user.name,
        birthday: user.birthday,
      });
    }

    try {
      await this.prisma.user.createMany({
        data: resData.map((item: UserJson) => ({
          name: item.name,
          viewName: item.name,
          email: item.email,
          password: item.password,
          birthday: item.birthday,
        })),
      });
    } catch (e) {
      return false;
    }

    return true;
  }
}
