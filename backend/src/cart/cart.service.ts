import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { category: true, brand: true } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!cart) {
      return this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { category: true, brand: true } } } } },
      });
    }

    return cart;
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException("Product not found");
    if (product.stock < dto.quantity) throw new BadRequestException("Sản phẩm không đủ hàng");

    const cart = await this.getCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    if (existing) {
      const newQuantity = existing.quantity + dto.quantity;
      if (product.stock < newQuantity) throw new BadRequestException("Sản phẩm không đủ hàng");
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: { include: { category: true, brand: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
      include: { product: { include: { category: true, brand: true } } },
    });
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });
    if (!item) throw new NotFoundException("Cart item not found");

    if (item.product.stock < dto.quantity) throw new BadRequestException("Sản phẩm không đủ hàng");

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: { include: { category: true, brand: true } } },
    });
  }

  async removeItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException("Cart item not found");

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}
