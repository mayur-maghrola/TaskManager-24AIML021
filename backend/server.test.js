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

  test("POST /api/ai/generate-description returns 200 and description with fallback", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .send({ title: "Study for AWDF Exam" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("description");
    expect(typeof res.body.description).toBe("string");
    expect(res.body.description.length).toBeGreaterThan(0);
  });
});
