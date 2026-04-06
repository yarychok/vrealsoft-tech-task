import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async searchByEmail(email: string, currentUserId: string) {
    const users = await this.userRepo.find({
      where: { email: ILike(`%${email}%`) },
      take: 10,
      select: ['id', 'email', 'name', 'avatarUrl'],
    });
    return users.filter((u) => u.id !== currentUserId);
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
}
