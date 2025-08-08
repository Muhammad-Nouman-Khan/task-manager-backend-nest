import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../user/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Attempting to register user with email: ${registerDto.email}`);
    
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(registerDto.email);
      if (existingUser) {
        this.logger.warn(`Registration failed: User with email ${registerDto.email} already exists`);
        throw new ConflictException('User with this email already exists');
      }

      // Create user with provided role or default to USER
      const user = await this.userService.create({
        ...registerDto,
        role: registerDto.role || Role.USER,
      });

      this.logger.log(`User registered successfully with ID: ${user.id}`);

      // Generate JWT token
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}:`, error.message);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    
    try {
      // Find user by email
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        this.logger.warn(`Login failed: User with email ${loginDto.email} not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Login successful for user ID: ${user.id}`);

      // Generate JWT token
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email}:`, error.message);
      throw error;
    }
  }
}