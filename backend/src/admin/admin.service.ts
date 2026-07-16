import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalProducts, todayOrders, totalRevenue] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);

    return {
      totalProducts,
      todayOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
