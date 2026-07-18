import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("123456", 10);

  // Tìm đoạn này và sửa thành:
await prisma.user.upsert({
  where: { email: "admin@gmail.com" },
  update: {
    password: adminPassword,
    role: Role.ADMIN,
  }, // Đưa mật khẩu và quyền vào đây để cập nhật nếu đã tồn tại
  create: {
    email: "admin@gmail.com",
    password: adminPassword,
    fullName: "Admin",
    role: Role.ADMIN,
  },
});

  const categories = await Promise.all(
    ["Gaming", "Văn phòng", "Sinh viên", "Đồ họa", "Cao cấp"].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const brands = await Promise.all(
    ["Dell", "Asus", "Apple", "HP", "MSI", "Lenovo"].map((name) =>
      prisma.brand.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const products = [
    {
      name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
      description: "MacBook Air M2 có thiết kế mỏng nhẹ, hiệu năng mạnh mẽ, thời lượng pin tốt.",
      price: 26490000,
      stock: 10,
      image: "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
      cpu: "Apple M2",
      ram: "8GB RAM",
      storage: "256GB SSD",
      screen: "13.6 inch Liquid Retina",
      gpu: "Apple GPU 8 nhân",
      warranty: "12 tháng chính hãng",
      categoryName: "Cao cấp",
      brandName: "Apple",
    },
    {
      name: "Asus TUF Gaming F15 FX506HF i5 11400H",
      description: "Asus TUF Gaming F15 là mẫu laptop gaming bền bỉ, hiệu năng ổn định.",
      price: 16990000,
      stock: 15,
      image: "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
      cpu: "Intel Core i5",
      ram: "8GB RAM",
      storage: "512GB SSD",
      screen: "15.6 inch Full HD 144Hz",
      gpu: "NVIDIA GeForce RTX 2050",
      warranty: "24 tháng chính hãng",
      categoryName: "Gaming",
      brandName: "Asus",
    },
    {
      name: "Lenovo LOQ Gaming Ryzen 7 7840HS",
      description: "Lenovo LOQ Gaming sở hữu cấu hình mạnh, RAM 16GB và GPU RTX.",
      price: 22990000,
      stock: 8,
      image: "https://cdn.tgdd.vn/Products/Images/44/317507/lenovo-loq-15aph8-r7-82xt001tvn-600x600.jpg",
      cpu: "AMD Ryzen 7",
      ram: "16GB RAM",
      storage: "512GB SSD",
      screen: "15.6 inch Full HD 144Hz",
      gpu: "NVIDIA GeForce RTX 4050",
      warranty: "24 tháng chính hãng",
      categoryName: "Gaming",
      brandName: "Lenovo",
    },
    {
      name: "HP Victus 15 FA1093TX i5 13420H",
      description: "HP Victus 15 cấu hình cân bằng, phù hợp gaming và học tập.",
      price: 18990000,
      stock: 12,
      image: "https://cdn.tgdd.vn/Products/Images/44/322267/hp-victus-15-fa1093tx-i5-8c5m2pa-600x600.jpg",
      cpu: "Intel Core i5",
      ram: "16GB RAM",
      storage: "512GB SSD",
      screen: "15.6 inch Full HD 144Hz",
      gpu: "NVIDIA GeForce RTX 2050",
      warranty: "24 tháng chính hãng",
      categoryName: "Gaming",
      brandName: "HP",
    },
  ];

  for (const p of products) {
    const category = categories.find((c) => c.name === p.categoryName)!;
    const brand = brands.find((b) => b.name === p.brandName)!;

    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          image: p.image,
          cpu: p.cpu,
          ram: p.ram,
          storage: p.storage,
          screen: p.screen,
          gpu: p.gpu,
          warranty: p.warranty,
          categoryId: category.id,
          brandId: brand.id,
        },
      });
    }
  }

  console.log("Seed completed: admin, categories, brands, products");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
