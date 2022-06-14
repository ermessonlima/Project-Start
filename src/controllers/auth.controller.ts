import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body) {
    return this.authService.login(body.username, body.password);
  }

  @Post('register')
  register(@Body() body) {
    return this.authService.register(
      body.firstName,
      body.lastName,
      body.email,
      body.password,
      body.passwordConfirmation,
    );
  }

  @Put('changePassword')
  changePassword(@Body() body) {
    if (!body.id) throw new HttpException('Invalid user id', 400);
    if (body.password !== body.passwordConfirmation)
      throw new HttpException('Different passwords', 400);

    return this.authService.changePassword(body.id, body.password);
  }

  @Get('getUser/:email')
  getUser(@Param('email') email) {
    return this.authService.getUser(email);
  }

  @Get('forgotPassword/:email')
  forgotPassword(@Param('email') email) {
    return this.authService.forgotPassword(email);
  }
}
