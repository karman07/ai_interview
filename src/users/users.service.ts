import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    return created.save();
  }

  async createGoogleUser(data: { name: string; email: string; googleId: string; profileImageUrl?: string }): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, partial: Partial<User>): Promise<UserDocument> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      partial,
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async setRefreshToken(userId: string, hash: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash }).exec();
  }
}
