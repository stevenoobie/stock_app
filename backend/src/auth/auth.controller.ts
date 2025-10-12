import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/loginDto';
import { AuthGuard } from './auth.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Public } from '../public/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @Public()
  async login(@Body() body: LoginDto) {
    return await this.authService.signIn(body.username, body.password);
  }
}
