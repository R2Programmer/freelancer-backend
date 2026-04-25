import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        userId,
        clientId: dto.clientId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    await this.activityLogs.log(
      userId,
      'PROJECT',
      project.id,
      'CREATE',
      `Created project ${project.title}`,
    );
    return project;
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: { client: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  }
}
