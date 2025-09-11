import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Conta inativa');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        profile: user.profile,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role = UserRole.FREELANCER } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    // Create profile
    const profile = this.profileRepository.create({
      user: savedUser,
    });

    await this.profileRepository.save(profile);

    // Generate JWT
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      name: savedUser.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        status: savedUser.status,
        avatar: savedUser.avatar,
        profile: profile,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, updateData: Partial<Profile>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.profile) {
      await this.profileRepository.update(user.profile.id, updateData);
    } else {
      const profile = this.profileRepository.create({
        ...updateData,
        user: user,
      });
      await this.profileRepository.save(profile);
    }

    return this.getProfile(userId);
  }
}
