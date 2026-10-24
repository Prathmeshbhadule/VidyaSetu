import { prisma } from '../db/prisma.js';
import { User, Prisma } from '@prisma/client';

export type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    student: true;
    teacher: true;
    guardian: true;
    admin: true;
  };
}>;

export class UserRepository {
  async findById(id: string): Promise<UserWithProfiles | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        guardian: true,
        admin: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfiles | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        teacher: true,
        guardian: true,
        admin: true,
      },
    });
  }

  async findByUsername(username: string): Promise<UserWithProfiles | null> {
    return prisma.user.findUnique({
      where: { username },
      include: {
        student: true,
        teacher: true,
        guardian: true,
        admin: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
