import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    message: string,
  ) {
    return this.prisma.activityLog.create({
      data: { userId, entityType, entityId, action, message },
    });
  }
}
