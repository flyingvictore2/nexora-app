import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfilesService {
  private MAX_PROFILES = 4;

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async create(userId: string, dto: CreateProfileDto) {
    const count = await this.prisma.profile.count({ where: { userId } });

    // Check subscription plan for max profiles
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const maxProfiles = subscription?.plan?.maxProfiles || 1;
    if (count >= maxProfiles) {
      throw new BadRequestException(`Your plan allows up to ${maxProfiles} profiles`);
    }

    let pin: string | undefined;
    if (dto.pin) pin = await bcrypt.hash(dto.pin, 10);

    return this.prisma.profile.create({
      data: {
        userId,
        name: dto.name,
        avatar: dto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.name}`,
        isKids: dto.isKids || false,
        language: dto.language || 'es',
        isDefault: count === 0,
        pin,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProfileDto) {
    const profile = await this.findOne(id, userId);

    let pin = profile.pin;
    if (dto.pin) pin = await bcrypt.hash(dto.pin, 10);
    if (dto.pin === '') pin = null;

    return this.prisma.profile.update({
      where: { id },
      data: {
        ...dto,
        pin: dto.pin !== undefined ? pin : undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    const profile = await this.findOne(id, userId);
    if (profile.isDefault) throw new BadRequestException('Cannot delete the default profile');

    await this.prisma.profile.delete({ where: { id } });
    return { message: 'Profile deleted' };
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.profile.updateMany({ where: { userId }, data: { isDefault: false } });
    return this.prisma.profile.update({ where: { id }, data: { isDefault: true } });
  }

  async verifyPin(id: string, userId: string, pin: string) {
    const profile = await this.findOne(id, userId);
    if (!profile.pin) return { valid: true };

    const valid = await bcrypt.compare(pin, profile.pin);
    return { valid };
  }
}
