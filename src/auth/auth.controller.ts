import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { RestorePassDto } from './dto/restorePass.dto';
import { FilePath } from './dto/userJson.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('/register')
  createUser(@Body() dto: RegisterUserDto, @Res() res: Response) {
    return this.authService.register(dto, res);
  }

  @Get('/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refresh(req, res);
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(JwtGuard)
  @Get('/isAuth')
  checkIsAuth(@Req() req: Request) {
    return this.authService.checkIsAuth(req);
  }

  @Post('/restorePass')
  restorePass(@Body() dto: RestorePassDto) {
    return this.authService.restorePass(dto);
  }

  @Post('/sendEmail')
  sendEmail(@Body() dto: RestorePassDto) {
    return this.authService.sendEmail(dto);
  }

  @Post('/loadUsersJson')
  loadUsersJson(@Body() dto: FilePath) {
    return this.authService.loadUsersJson(dto);
  }

  //@UseGuards(JwtGuard)
  @Get('/test')
  test(@Req() req: Request) {
    return { message: 'Success!!!' };
  }
}
