const request = require("supertest");
const app = require("./server");

describe("Task Management Application API Tests", () => {
  test("GET /tasks returns 200", async () => {
    const res = await request(app).get("/tasks");
    // Deliberately broken expectation to test CI failure (expected 200, but expecting 500)
    expect(res.statusCode).toBe(500);
  });

  test("GET / returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
