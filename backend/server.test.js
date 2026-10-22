const request = require("supertest");
const app = require("./server");

describe("Task Management Application API Tests", () => {
  test("GET /tasks returns 200", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
  });

  test("GET / returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
