const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

async function runEventEmitterVerification() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/AWDF";
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for test setup.");

  // Find or create test user
  let user = await User.findOne({ email: "event_tester@example.com" });
  if (!user) {
    user = await User.create({
      username: "EventTester",
      email: "event_tester@example.com",
      password: "password123",
    });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "supersecretjwtkey_awdf_taskmanager_2026",
    { expiresIn: "1h" }
  );

  console.log("Test user ready with ID:", user._id);
  console.log("Generated JWT Token:", token);

  const testTaskTitle = `Async Notification Task ${Date.now()}`;
  console.log(`\n======================================================`);
  console.log(`SENDING POST /tasks REQUEST`);
  console.log(`Task Title: "${testTaskTitle}"`);
  console.log(`======================================================`);

  const requestStartTime = Date.now();
  console.log(`[CLIENT] Sending POST /tasks at: ${new Date().toISOString()}`);

  const makePostRequest = () => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        title: testTaskTitle,
        text: testTaskTitle,
      });

      const options = {
        hostname: "localhost",
        port: 3000,
        path: "/tasks",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          Authorization: `Bearer ${token}`,
        },
      };

      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const clientReceiveTime = Date.now();
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
            durationMs: clientReceiveTime - requestStartTime,
            clientReceivedAt: new Date(clientReceiveTime).toISOString(),
          });
        });
      });

      req.on("error", (err) => reject(err));
      req.write(postData);
      req.end();
    });
  };

  try {
    const res = await makePostRequest();
    console.log(`\n[CLIENT] Received HTTP ${res.statusCode} Response at: ${res.clientReceivedAt}`);
    console.log(`[CLIENT] Response Time: ${res.durationMs} ms (IMMEDIATE response!)`);
    console.log(`[CLIENT] Response Body:`, JSON.stringify(res.body, null, 2));

    console.log(`\nWaiting 3 seconds to let asynchronous background notification listener complete...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`\nVerification finished.`);
  } catch (err) {
    console.error("Request failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runEventEmitterVerification();
