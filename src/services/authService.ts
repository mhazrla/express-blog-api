import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from "../repositories/userRepository";
import { ValidationError, AuthenticationError } from "../utils/customErrors";

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
  }

  async register(data: { name?: string; email?: string; password?: string }) {
    const { name, email, password } = data;

    if (!name || !email || !password) {
      throw new ValidationError("All fields are required");
    }

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({ name, email, passwordHash });
    
    // PERBAIKAN: Pastikan konversi ke string aman
    const userIdStr = String(user._id); 
    const token = this.generateToken(userIdStr);

    return {
      token,
      user: { id: userIdStr, name: user.name, email: user.email }
    };
  }

  async login(data: { email?: string; password?: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new ValidationError("All fields are required");
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AuthenticationError();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError();
    }

    const userIdStr = String(user._id);
    const token = this.generateToken(userIdStr);

    return {
      token,
      user: { id: userIdStr, name: user.name, email: user.email }
    };
  }
}