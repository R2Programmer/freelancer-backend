import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [totalClients, totalProjects, activeProjects, recentProjects] =
      await Promise.all([
        this.prisma.client.count({ where: { userId } }),
        this.prisma.project.count({ where: { userId } }),
        this.prisma.project.count({
          where: { userId, status: 'IN_PROGRESS' },
        }),
        this.prisma.project.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { client: { select: { id: true, name: true } } },
        }),
      ]);

    return { totalClients, totalProjects, activeProjects, recentProjects };
  }
}
