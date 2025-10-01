// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html at /

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn("⚠️  Missing OPENAI_API_KEY. Set it in .env");
}

// ---- PROMPTS LIBRARY ----
const PROMPTS = {
  "1": `🔹 Prompt 1: Context / Meaning

Task: Create four types of vocabulary multiple-choice questions using the word pair “[word1] / [word2].” The goal is to test the learner’s ability to understand the meaning of the target word in context.

⸻

1. Statement-based Multiple Choice
• Write one complete sentence that naturally uses either [word1] or [word2].
• Provide four full-sentence answer choices that interpret the sentence in context.
• One correct answer, one clearly wrong answer, and two plausible distractors.
• Do not add a separate follow-up question — the sentence itself should carry the meaning.

⸻

2. Dialogue-based Multiple Choice
• Write a short two-person dialogue where one speaker naturally uses either [word1] or [word2].
• After the dialogue, ask a natural comprehension question (e.g., “Where did they eat?” instead of “What does [word] mean?”).
• Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

3. Gap-fill Multiple Choice
• Write a single sentence with one blank, where the correct word is either [word1] or [word2].
• Provide four full-sentence answer choices that complete the sentence logically and grammatically.
• One correct answer, one clearly wrong answer, and two plausible distractors.

⸻

4. Underlined Target Word Multiple Choice
• Write a single sentence where either [word1] or [word2] is underlined.
• Provide four single-word answer choices that could replace the underlined word.
• One correct answer, one clearly wrong answer, and two plausible distractors.`,

  "2": `🔹 Prompt 2: Opposites

Task: Create four types of vocabulary multiple-choice questions using the word pair “[word1] / [word2],” where the learner must identify the opposite word in each case.

⸻

1. Statement-based Opposite Multiple Choice
• Write one complete sentence that naturally uses either [word1] or [word2].
• Provide four full-sentence answer choices that interpret the sentence in context, with the correct one being the opposite of the target word.

⸻

2. Dialogue-based Opposite Multiple Choice
• Write a short two-person dialogue where one speaker naturally uses either [word1] or [word2].
• After the dialogue, ask a natural comprehension question that requires identifying the opposite.
• Provide four full-sentence answer choices (one correct opposite, one clearly wrong, and two plausible distractors).

⸻

3. Gap-fill Opposite Multiple Choice
• Write a single sentence with one blank, where the correct answer is the opposite of the other word in context.
• Provide four full-sentence answer choices that complete the sentence logically and grammatically.

⸻

4. Underlined Target Word Opposite Multiple Choice
• Write a single sentence where either [word1] or [word2] is underlined.
• Provide four single-word answer choices, with the correct one being the opposite word.`,

  "3": `🔹 Prompt 3: Definitions

Task: Create four types of multiple-choice definition questions using the target word “[word].”

⸻

1. Statement-based Definition Multiple Choice
• Write a short clue sentence that describes the target word.
• Provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

2. Dialogue-based Definition Multiple Choice
• Write a short two-person dialogue that describes or hints at the target word.
• After the dialogue, provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

3. Gap-fill Definition Multiple Choice
• Write a single sentence with one blank, where the target word is the correct answer.
• Provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

4. Underlined Target Word Definition Multiple Choice
• Write a sentence where the target word is underlined.
• Provide four short-phrase definition answer choices (one correct, one clearly wrong, and two plausible distractors).`,

  "4": `🔹 Prompt 4: Themes

Task: Create four types of vocabulary multiple-choice questions using nouns that fit into clear themes or categories (e.g., bank, supermarket, library, church, hospital, stadium). The goal is for the learner to choose the correct thematic location or category.

⸻

1. Statement-based Theme Multiple Choice
• Write one complete sentence using a noun in context.
• Provide four full-sentence answer choices that identify possible thematic locations/categories.
• One correct, one clearly wrong, and two plausible distractors.

⸻

2. Dialogue-based Theme Multiple Choice
• Write a short two-person dialogue where the context suggests a thematic location.
• Follow with a natural comprehension question (e.g., “Where was he?” / “Where did she go?”).
• Provide four full-sentence answer choices.

⸻

3. Gap-fill Theme Multiple Choice
• Write a single sentence with a blank.
• The blank should be filled with the correct thematic location.
• Provide four full-sentence answer choices.

⸻

4. Underlined Target Word Theme Multiple Choice
• Write a single sentence where the thematic noun is underlined.
• Provide four full-sentence answer choices that identify the theme or category.`,

  "5": `🔹 Prompt 5: Grammar

Task: Create four types of grammar multiple-choice questions using a target grammar structure.

⸻

1. Statement-based Grammar Multiple Choice
• Write one complete sentence using the target grammar.
• Provide four full-sentence answer choices that test understanding of the grammar form.
• One must be correct (equivalent meaning), one clearly wrong, and two plausible distractors.
• Do not add a separate follow-up question — the sentence itself should carry the meaning.

⸻

2. Dialogue-based Grammar Multiple Choice
• Write a short two-person dialogue where one speaker naturally uses the target grammar.
• Follow with a natural comprehension-style question (e.g., “Does he still jog now?” / “Has the work been finished?”).
• Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

3. Gap-fill Grammar Multiple Choice
• Write a single sentence with one blank where the learner must supply the correct grammar form.
• Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

⸻

4. Sentence Order Grammar Multiple Choice
• Present four complete sentences (one correct, three incorrect/scrambled).
• Instruction: “Choose the correct sentence.”
• Provide four answer choices with only one correct word order.`
};

// Helpers
function buildPrompt(promptType, word1 = "", word2 = "", definition = "", grammar = "") {
  const template = PROMPTS[String(promptType) || "1"];
  return template
    .replaceAll("[word1]", word1 || "[word1]")
    .replaceAll("[word2]", word2 || "[word2]")
    .replaceAll("[word]", word1 || "[word]")
    .replaceAll("[definition]", definition || "[definition]")
    .replaceAll("[grammar]", grammar || "[grammar]");
}

// API route
app.post("/api/generate", async (req, res) => {
  try {
    const { promptType, word1, word2, definition, grammar, model: modelFromClient, strict } = req.body || {};

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "❌ Missing API key in environment variables" });
    }

    // Choose model (client can override; default is safe)
    const model = (modelFromClient && String(modelFromClient).trim()) || process.env.OPENAI_MODEL || "gpt-4o-mini";

    const userPrompt = buildPrompt(promptType, word1, word2, definition, grammar);

    const payload = {
      model,
      messages: [
        {
          role: "system",
          content: "You are a strict question generator. Only Section 3 may contain blanks (____). Sections 1, 2, and 4 must never contain blanks."
        },
        { role: "user", content: userPrompt }
      ]
    };

    // ✅ Only add temperature if model supports it on /chat/completions
    if (!/^gpt-5/i.test(model) && !/^gpt-4\.1/i.test(model)) {
      payload.temperature = 0.2; // focused for 4o/4o-mini, etc.
    } else {
      delete payload.temperature;
    }

    // Use native fetch (Node 18+)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "❌ OpenAI API error", details: data.error || data });
    }

    const output = data?.choices?.[0]?.message?.content || "";

    // Optional validation: blanks only in section 3
    if (strict) {
      const lines = output.split(/\r?\n/);
      let section = 0;
      let driftFound = false;

      for (const raw of lines) {
        const line = raw.trim();

        // Recognize genuine section headers like "1) "
        const match = line.match(/^([1-9])\)\s/);
        if (match) section = parseInt(match[1], 10);

        if (line.includes("____") && section !== 3) {
          driftFound = true;
          break;
        }
      }

      if (driftFound) {
        return res.status(400).json({
          error: "❌ Drift detected",
          details: "Blanks were used outside Section 3",
          rawOutput: output
        });
      }
    }

    return res.status(200).json({ output });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err?.message || String(err) });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
