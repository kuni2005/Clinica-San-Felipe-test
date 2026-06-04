import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

interface User {
  id: number;
  username: string;
  passwordHash: string;
}

// Single in-memory admin user (SOLID-S: auth logic isolated here)
const USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    // bcrypt hash of 'admin123'
    passwordHash: '$2b$10$pZnwnwZrEeXbYaqQFhRpS.18M58tAmBqj.Xn8PoySuzmsUH7N1r7i',
  },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = USERS.find((u) => u.username === dto.username);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(payload: { sub: number; username: string }) {
    return USERS.find((u) => u.id === payload.sub) ?? null;
  }
}
