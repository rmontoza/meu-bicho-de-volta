import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserStatus } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.termsAccepted) {
      throw new BadRequestException('Você precisa aceitar os termos de uso.');
    }

    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      city: dto.city,
      state: dto.state,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });

    await this.usersRepo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        name: true,
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Conta bloqueada. Entre em contato com o suporte.');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('Conta não encontrada.');
    }

    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  async getMe(userId: string) {
    return this.usersRepo.findOne({ where: { id: userId } });
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret') as string,
      expiresIn: this.config.get<string>('jwt.expiresIn') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret') as string,
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as any,
    });

    return { accessToken, refreshToken, userId: user.id };
  }
}
