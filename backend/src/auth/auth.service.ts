import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(data: GoogleUserData): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { googleId: data.googleId },
    });

    if (!user) {
      user = await this.userRepo.findOne({
        where: { email: data.email },
      });

      if (user) {
        user.googleId = data.googleId;
        user.avatarUrl = user.avatarUrl || data.avatarUrl;
        await this.userRepo.save(user);
      } else {
        user = this.userRepo.create({
          email: data.email,
          name: data.name,
          googleId: data.googleId,
          avatarUrl: data.avatarUrl,
        });
        await this.userRepo.save(user);
      }
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getOrCreateDevUser(): Promise<User> {
    const devEmail = 'dev@vrealsoft.local';
    let user = await this.userRepo.findOne({ where: { email: devEmail } });
    if (!user) {
      user = this.userRepo.create({
        email: devEmail,
        name: 'Dev User',
        googleId: 'dev-local',
      });
      await this.userRepo.save(user);
    }
    return user;
  }
}
