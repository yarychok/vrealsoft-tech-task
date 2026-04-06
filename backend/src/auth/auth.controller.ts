import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request & { user: User }, @Res() res: Response) {
    const { accessToken } = this.authService.generateToken(req.user);
    const frontendUrl = this.config.get<string>('frontendUrl');
    res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`,
    );
  }

  @Post('dev-login')
  async devLogin() {
    if (this.config.get<string>('nodeEnv') === 'production') {
      return { error: 'Not available in production' };
    }
    const user = await this.authService.getOrCreateDevUser();
    return this.authService.generateToken(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
