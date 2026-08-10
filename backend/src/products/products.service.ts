import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { Role } from "@prisma/client";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto, userRole?: Role) {
    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search };
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.cpu) where.cpu = query.cpu;
    if (query.ram) where.ram = query.ram;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (query.sort === "price_asc") orderBy = { price: "asc" };
    if (query.sort === "price_desc") orderBy = { price: "desc" };
    if (query.sort === "newest") orderBy = { createdAt: "desc" };

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true, brand: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, brand: true },
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive },
      include: { category: true, brand: true },
    });
  }

  // 🛠 KIỂM TRA LỊCH SỬ ĐƠN HÀNG TRƯỚC KHI CHO PHÉP XÓA
  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Nếu sản phẩm đã từng nằm trong đơn hàng, chặn tuyệt đối không cho xóa cứng
    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        "Sản phẩm đã có trong lịch sử đơn hàng, không thể xóa. Bạn vui lòng sử dụng tính năng Ngừng kinh doanh.",
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Dọn dẹp các mục giỏ hàng liên quan trước khi xóa sản phẩm
        await tx.cartItem.deleteMany({ where: { productId: id } }).catch(() => {});
        return await tx.product.delete({ where: { id } });
      });
    } catch (error: any) {
      console.error("LỖI XÓA SẢN PHẨM:", error);
      throw new BadRequestException(`Không thể xóa sản phẩm vì vướng ràng buộc dữ liệu: ${error.message}`);
    }
  }
}