import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBrandDto } from "./dto/create-brand.dto";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateBrandDto) {
    return this.prisma.brand.create({ data: dto });
  }

  async update(id: number, dto: CreateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException("Brand not found");
    return brand;
  }
}
