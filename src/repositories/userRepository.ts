import User, { IUser } from "../models/User";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }
}