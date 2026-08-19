import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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
    // 1. Tìm Brand và include thêm Products 
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true }, // Móc nối bảng products
    });
  
    if (!brand) {
      throw new NotFoundException("Không tìm thấy thương hiệu này");
    }
  
    // 2. Chặn xóa nếu thương hiệu đang chứa sản phẩm
    if (brand.products.length > 0) {
      throw new BadRequestException(
        `Không thể xóa! Thương hiệu này đang có ${brand.products.length} sản phẩm. Vui lòng gỡ bỏ các sản phẩm liên quan trước.`
      );
    }
  
    // 3. Thực thi xóa
    return this.prisma.brand.delete({
      where: { id },
    });
  }

  private async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException("Brand not found");
    return brand;
  }
}
