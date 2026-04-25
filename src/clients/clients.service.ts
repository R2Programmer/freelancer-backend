import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
  ) {}

  async create(userId: string, dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: { ...dto, userId },
    });
    await this.activityLogs.log(
      userId,
      'CLIENT',
      client.id,
      'CREATE',
      `Created client ${client.name}`,
    );
    return client;
  }

  async findAll(userId: string) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: { projects: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(userId, id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.client.delete({ where: { id } });
    return { message: 'Client deleted' };
  }
}
