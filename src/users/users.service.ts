import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  private async getFreeTierPlan() {
    return this.subscriptionModel.findOne({ name: /free_tier/i }).exec();
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const freePlan = await this.getFreeTierPlan();

    const created = new this.userModel({
      ...dto,
      passwordHash,
      subscriptionPlan: freePlan?._id,
      subscriptionStatus: 'free',
    });
    return created.save();
  }

  async createGoogleUser(data: { name: string; email: string; googleId: string; profileImageUrl?: string }): Promise<UserDocument> {
    const freePlan = await this.getFreeTierPlan();

    const created = new this.userModel({
      ...data,
      isEmailVerified: true,
      subscriptionPlan: freePlan?._id,
      subscriptionStatus: 'free',
    });
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByRazorpaySubscriptionId(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ razorpaySubscriptionId: id }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .populate('subscriptionPlan')
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('subscriptionPlan').exec();
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

  async adminUpdateUserPlan(
    userId: string,
    planId: string | null,
    status: string,
    expiryDays?: number,
  ): Promise<UserDocument> {
    const plan = planId
      ? await this.subscriptionModel.findById(planId).exec()
      : await this.getFreeTierPlan();

    if (!plan) throw new NotFoundException('Subscription plan not found');

    const expiry = expiryDays && expiryDays > 0
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
      : undefined;

    const update: any = {
      subscriptionPlan: plan._id,
      subscriptionStatus: status,
    };
    if (expiry) update.subscriptionExpiry = expiry;

    const updated = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .populate('subscriptionPlan')
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
