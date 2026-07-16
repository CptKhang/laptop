import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post("items")
  addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch("items/:id")
  updateItem(@Request() req, @Param("id") id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.id, +id, dto);
  }

  @Delete("items/:id")
  removeItem(@Request() req, @Param("id") id: string) {
    return this.cartService.removeItem(req.user.id, +id);
  }
}
