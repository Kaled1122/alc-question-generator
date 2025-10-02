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
 Task: Create four types of multiple-choice questions using the 5 main language functions listed as "prompts" below. The goal is to test the learner’s ability to understand the language functions, meanings, and structures. Each language function has a set of instructions and contains examples that fulfill the criteria for creating the questions.

Prompt 1: Synonyms

1. Statement-based Multiple Choice
* Write one complete sentence that naturally uses either [word1] or [word2].
* Provide four full-sentence answer choices that interpret the sentence in context.
* One correct answer, one clearly wrong answer, and two plausible distractors.
* Do not add a separate follow-up question — the sentence itself should carry the meaning.

Example:
Most students thought the test was hard.

Options:
a) The test was considered difficult.
b) The test was easy for everyone.
c) The test was very long.
d) The test wasn’t hard.

2. Dialogue-based Multiple Choice
* Write a short two-person dialogue where one speaker naturally uses either [word1] or [word2].
* After the dialogue, ask a natural comprehension question (e.g., “Where did they eat?” instead of “What does [word] mean?”).
* Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
James: I don’t have a cell phone with me. Is there a public phone around?
David: Yes, there’s one by the entrance.

What is James asking for?

a) He is asking for a private phone.
b) He is asking for a cell phone.
c) He is asking for a pay phone.
d) He is asking for a service desk.


3. Gap-fill Multiple Choice
* Write a single sentence with one blank, where the correct word is either [word1] or [word2].
* Provide four full-sentence answer choices that complete the sentence logically and grammatically.
* One correct answer, one clearly wrong answer, and two plausible distractors.

Example:
The officer acted __ to control the situation.
a) immediately
b) slowly
c) later
d) eventually


4. Underlined Target Word Multiple Choice
* Write a single sentence where either [word1] or [word2] is underlined.
* Provide four single-word answer choices that could replace the underlined word.
* One correct answer, one clearly wrong answer, and two plausible distractors.

Example: 
John, fill out the form before submitting it
a) discuss
b) complete
c) read
d) sent

Prompt 2: Opposites

Task: Create four types of vocabulary multiple-choice questions using the word pair “[word1] / [word2],” where the learner must identify the opposite word in each case.


1. Statement-based Opposite Multiple Choice
* Write one complete sentence that naturally uses either [word1] or [word2].
* Provide four full-sentence answer choices that interpret the sentence in context, with the correct one being the opposite of the target word.

Example:
That child is very sad.
a) The child is not happy.
b) The child is very happy.
c) The child is satisfied.
d) The child is very tired.

2. Dialogue-based Opposite Multiple Choice
* Write a short two-person dialogue where one speaker naturally uses either [word1] or [word2].
* After the dialogue, ask a natural comprehension question that requires identifying the opposite.
* Provide four full-sentence answer choices (one correct opposite, one clearly wrong, and two plausible distractors).

Example:
John: Are we ahead of schedule?
Tom: Unfortunately, we’ve taken longer than expected.

A) They are currently behind schedule.
B) They are still ahead of schedule.
C) They are making better progress than expected.
D) They are perfectly on schedule without delays.

3. Gap-fill Opposite Multiple Choice
* Write a single sentence with one blank, where the correct answer is the opposite of the other word in context.
* Provide four full-sentence answer choices that complete the sentence logically and grammatically.

Example:
You will find the book on the top shelf, not on the                shelf.

a) bottom
b) top
c) horizontal
d) above

4. Underlined Target Word Opposite Multiple Choice
* Write a single sentence where either [word1] or [word2] is underlined.
* Provide four single-word answer choices, with the correct one being the opposite word.

Example:
The road ahead was very straight.
a) It was curved.
b) It was not curved.
c) It was not very straight.
d) It was a little busy.

Prompt 3: Definitions

Task: Create four types of multiple-choice definition questions using the target word [word].


1. Statement-based Definition Multiple Choice
* Write a short clue sentence that describes the target word.
* Provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
Carla works in a clothing store and helps customers choose the right size and style.

Question: What is Carla’s job?
a. She’s a manager
b. She’s a saleswoman
c. She’s a customer
d. She’s a security guard

2. Dialogue-based Definition Multiple Choice
* Write a short two-person dialogue that describes or hints at the target word.
* After the dialogue, provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
Lisa: I heard that hiking alone in the mountains can be scary.
John: You’re right. It’s not safe.
What does Lisa think about hiking alone?
A. It’s dangerous.
B. It’s easy.
C. It’s boring.
D. It’s fun.

3. Gap-fill Definition Multiple Choice
* Write a single sentence with one blank, where the target word is the correct answer.
* Provide four single-word answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
A __ has four straight sides, and all of them are the same size.
A. triangle
B. rectangle
C. circle
D. square

4. Underlined Target Word Definition Multiple Choice
* Write a sentence where the target word is underlined.
* Provide four short-phrase definition answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
When Jason took a picture, there was a bright light coming from the camera.
A. snap
B. flash
C. dim
D. spark

  Prompt 4: Themes

Task: Create four types of vocabulary multiple-choice questions using nouns that fit into clear themes or categories (e.g., bank, supermarket, library, church, hospital, stadium). The goal is for the learner to choose the correct thematic location or category.

1. Statement-based Theme Multiple Choice
* Write one complete sentence using a noun in context.
* Provide four full-sentence answer choices that identify possible thematic locations/categories.
* One correct, one clearly wrong, and two plausible distractors.

Example:
Mark sat down in his favorite seat with armrests while reading his book near the window.

A) He sat on the carpet.
B) He sat in an armchair.
C) He sat at the couch.
D) He sat on a large sofa.

2. Dialogue-based Theme Multiple Choice
* Write a short two-person dialogue where the context suggests a thematic location.
* Follow with a natural comprehension question (e.g., “Where was he?” / “Where did she go?”).
* Provide four full-sentence answer choices.

Example:
Max: I wanted to buy a new coat, but the prices were too high at the department store.
Thomas: "Maybe you should go to a store that sells items for lower prices.

Question:
Where does Thomas suggest to shop?
a) He should try shopping at a discount store.
b) He suggests shopping at a luxury store.
c) She should go to an expensive department store.
d) She should try a vending machine for quick snacks.

3. Gap-fill Theme Multiple Choice
* Write a single sentence with a blank.
* The blank should be filled with the correct thematic location.
* Provide four full-sentence answer choices.

Example:
Tom set his __ before going to bed so he wouldn’t be late for work.
a) alarm clock
b) coat hanger
c) bedroom closet
d) electricity bill

Prompt 5: Grammar

Task: Create four types of grammar multiple-choice questions using a target grammar structure.


1. Statement-based Grammar Multiple Choice
* Write one complete sentence using the target grammar.
* Provide four full-sentence answer choices that test understanding of the grammar form.
* One must be correct (equivalent meaning), one clearly wrong, and two plausible distractors.
* Do not add a separate follow-up question — the sentence itself should carry the meaning.

Example:
Of all the cars we tested, this one is the most expensive, but it’s also the least reliable.
What does he say about the car?
a) It is the least expensive and the least reliable.
b) It is the most expensive but also the least reliable.
c) It is the most reliable and the least expensive.
d) It is the least expensive but the most reliable.


2. Dialogue-based Grammar Multiple Choice
* Write a short two-person dialogue where one speaker naturally uses the target grammar.
* Follow with a natural comprehension-style question (e.g., “Does he still jog now?” / “Has the work been finished?”).
* Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
Mat: "Tom, the coach told me that we needed to arrive at practice 15 minutes early tomorrow."
Tom: "I guess we’ll need to leave home earlier than usual."
What did the coach tell Mat?
a) The coach told him they were arriving late to practice.
b) The coach told him they had to be there earlier tomorrow.
c) The coach said him to came 15 minutes later.
d) The coach said them practice was early tomorrow.

3. Gap-fill Grammar Multiple Choice
* Write a single sentence with one blank where the learner must supply the correct grammar form.
* Provide four full-sentence answer choices (one correct, one clearly wrong, and two plausible distractors).

Example:
Matthew arrived ____ today than he did yesterday.
a) early
b) earlyer
c) earlier 
d) more early

4. Sentence Order Grammar Multiple Choice
* Present four complete sentences (one correct, three incorrect/scrambled).
* Instruction: “Choose the correct sentence.”
* Provide four answer choices with only one correct word order.

Example:
Choose the best sentence :
a) The library is open in 8 p.m.
b) The library are open since 8 p.m.
c) The library  opens at  8 a.m. 
d) The library is opened from 8 p.m.
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

