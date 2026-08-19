import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: CreateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    // 1. Tìm Category và include thêm Products để đếm
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true }, // Móc nối bảng products
    });
  
    if (!category) {
      throw new NotFoundException("Không tìm thấy danh mục này");
    }
  
    // 2. Chặn đứng hành động xóa nếu danh mục đang chứa sản phẩm
    if (category.products.length > 0) {
      throw new BadRequestException(
        `Không thể xóa! Danh mục này đang chứa ${category.products.length} sản phẩm. Hãy xóa hoặc chuyển danh mục cho các sản phẩm đó trước.`
      );
    }
  
    // 3. Xóa an toàn khi mảng products rỗng
    return this.prisma.category.delete({
      where: { id },
    });
  }

  private async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }
}
