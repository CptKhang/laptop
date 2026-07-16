import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipe(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Auth", () => {
    const email = `test${Date.now()}@example.com`;

    it("registers a user", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({ fullName: "Test", email, password: "123456" })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.email).toBe(email);
        });
    });

    it("logs in and returns token", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({ email, password: "123456" })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe(email);
        });
    });
  });

  describe("Products", () => {
    it("returns paginated products", () => {
      return request(app.getHttpServer())
        .get("/products?limit=2")
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(res.body.items.length).toBeLessThanOrEqual(2);
          expect(res.body.total).toBeDefined();
        });
    });

    it("returns product detail", () => {
      return request(app.getHttpServer())
        .get("/products/1")
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
        });
    });
  });
});
