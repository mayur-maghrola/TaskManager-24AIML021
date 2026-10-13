const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel");
const Todo = require("./models/todoModel");
const jwt = require("jsonwebtoken");

async function runBenchmark() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/AWDF";
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Find or create test user
  let user = await User.findOne({ email: "benchmark_test@example.com" });
  if (!user) {
    user = await User.create({
      username: "benchtester",
      email: "benchmark_test@example.com",
      password: "password123",
    });
  }

  // Ensure some tasks exist
  const existingCount = await Todo.countDocuments({ userId: user._id });
  if (existingCount < 5) {
    for (let i = 1; i <= 5; i++) {
      await Todo.create({
        text: `Benchmark Task ${i} - Sample Data`,
        userId: user._id,
        status: i % 2 === 0 ? "Completed" : "Pending",
      });
    }
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "1h" }
  );

  console.log("Test user ready. Token generated.");

  const makeRequest = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const startTime = process.hrtime.bigint();
      const options = {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const endTime = process.hrtime.bigint();
          const durationMs = Number(endTime - startTime) / 1e6;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            durationMs: durationMs,
            data: data,
          });
        });
      });

      req.on("error", (err) => reject(err));
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    console.log("\n==========================================");
    console.log("   TEST RUN 1: WITH IN-MEMORY CACHING   ");
    console.log("==========================================");
    
    // Request 1: Cache Miss
    const res1 = await makeRequest("GET", "/tasks");
    console.log(`Request 1 (Miss): Status=${res1.statusCode}, X-Cache=${res1.headers["x-cache"]}, Time=${res1.durationMs.toFixed(2)} ms`);

    // Request 2: Cache Hit
    const res2 = await makeRequest("GET", "/tasks");
    console.log(`Request 2 (Hit) : Status=${res2.statusCode}, X-Cache=${res2.headers["x-cache"]}, Time=${res2.durationMs.toFixed(2)} ms`);

    // Request 3: Cache Hit
    const res3 = await makeRequest("GET", "/tasks");
    console.log(`Request 3 (Hit) : Status=${res3.statusCode}, X-Cache=${res3.headers["x-cache"]}, Time=${res3.durationMs.toFixed(2)} ms`);

    console.log("\n==========================================");
    console.log("   TEST RUN 2: CACHE INVALIDATION ON WRITE ");
    console.log("==========================================");
    const postRes = await makeRequest("POST", "/tasks", { text: `New Task Invalidation Check ${Date.now()}` });
    console.log(`POST /tasks (Create): Status=${postRes.statusCode}`);

    const resAfterPost = await makeRequest("GET", "/tasks");
    console.log(`GET /tasks (After Post - Miss): Status=${resAfterPost.statusCode}, X-Cache=${resAfterPost.headers["x-cache"]}, Time=${resAfterPost.durationMs.toFixed(2)} ms`);

    const resHitAgain = await makeRequest("GET", "/tasks");
    console.log(`GET /tasks (Subsequent - Hit) : Status=${resHitAgain.statusCode}, X-Cache=${resHitAgain.headers["x-cache"]}, Time=${resHitAgain.durationMs.toFixed(2)} ms`);

    console.log("\nToken for Postman / Thunder Client testing:");
    console.log(`Bearer ${token}`);
  } catch (error) {
    console.error("Benchmark error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runBenchmark();
