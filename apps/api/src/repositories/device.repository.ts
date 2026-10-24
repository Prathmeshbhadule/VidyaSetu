import { prisma } from '../db/prisma.js';
import { Device, Prisma } from '@prisma/client';

export class DeviceRepository {
  async findById(id: string): Promise<Device | null> {
    return prisma.device.findUnique({
      where: { id },
      include: { school: true },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<Device | null> {
    return prisma.device.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
      },
      include: { school: true },
    });
  }

  async findMany(schoolId?: string): Promise<Device[]> {
    return prisma.device.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
      },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async upsert(data: Prisma.DeviceUncheckedCreateInput): Promise<Device> {
    return prisma.device.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        type: data.type,
        lastSeenAt: new Date(),
        ...(data.tokenHash ? { tokenHash: data.tokenHash } : {}),
      },
    });
  }

  async updateLastSeen(id: string): Promise<void> {
    await prisma.device.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  async revoke(id: string): Promise<Device> {
    return prisma.device.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

export const deviceRepository = new DeviceRepository();
