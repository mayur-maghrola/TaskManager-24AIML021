const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

/**
 * Intelligent contextual fallback description generator
 * Used when API key is missing, invalid, or AI call times out.
 */
const generateFallbackDescription = (title) => {
  const cleanTitle = (title || "Task").trim();
  const lower = cleanTitle.toLowerCase();

  if (
    lower.includes("study") ||
    lower.includes("exam") ||
    lower.includes("read") ||
    lower.includes("revision")
  ) {
    return `Review study materials, summarize key lecture notes, and practice revision problems for ${cleanTitle}.`;
  }
  if (
    lower.includes("bug") ||
    lower.includes("fix") ||
    lower.includes("issue") ||
    lower.includes("debug")
  ) {
    return `Investigate the root cause, replicate the issue in development, and deploy a verified fix for ${cleanTitle}.`;
  }
  if (
    lower.includes("meeting") ||
    lower.includes("call") ||
    lower.includes("sync")
  ) {
    return `Prepare agenda items, attend the scheduled discussion, and distribute action points for ${cleanTitle}.`;
  }
  if (
    lower.includes("buy") ||
    lower.includes("shop") ||
    lower.includes("purchase")
  ) {
    return `List required items, verify budget/options, and complete purchase for ${cleanTitle}.`;
  }
  return `Plan deliverables, execute core action items, and verify completion criteria for "${cleanTitle}".`;
};

// @route   POST /api/ai/generate-description or /ai/generate-description
// @desc    Generate an AI task description based on task title with safe fallback
// @access  Public
router.post("/generate-description", async (req, res) => {
  const title = req.body.title || req.body.text || "";
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (
      !apiKey ||
      apiKey.includes("your_key") ||
      apiKey.includes("invalid") ||
      apiKey.includes("demo")
    ) {
      throw new Error("Simulated fallback or invalid API key");
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise productivity assistant. Write a short, crisp, practical 1-to-2 sentence description for the given task title. Do not include quotes.",
        },
        {
          role: "user",
          content: `Write a short task description for: ${title}`,
        },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    const description =
      completion.choices[0]?.message?.content?.trim() || "";
    return res.json({
      description,
      fallback: false,
      model: "gpt-4o-mini",
    });
  } catch (err) {
    console.warn(
      "[AI Service Notice] Using fallback description due to:",
      err.message
    );
    const fallbackDesc = generateFallbackDescription(title);
    return res.status(200).json({
      description: fallbackDesc,
      fallback: true,
      reason: err.message,
    });
  }
});

module.exports = router;
