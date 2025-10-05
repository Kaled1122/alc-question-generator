import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ✅ Allow frontend hosted on Vercel to connect
app.use(cors({
  origin: ["https://alc-question-generator.vercel.app"], // your Vercel frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ---------------------------------------------------------------------------
// ✅ Verify environment
// ---------------------------------------------------------------------------
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in Vercel environment!");
  process.exit(1);
}
console.log("✅ OPENAI_API_KEY detected.");

// Initialize OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// ✅ Full Prompt Templates (with your original examples and formats)
// ---------------------------------------------------------------------------
const promptTemplates = {
  1: `
Prompt 1: Synonyms

Task: Create four types of multiple-choice questions using the word pair “[word1] / [word2].”
The goal is to test learners’ understanding of synonym relationships and semantic similarity.

1. Statement-based Multiple Choice
Example:
Most students thought the test was hard.
a) The test was considered difficult. (Correct)
b) The test was easy for everyone.
c) The test was very long.
d) The test wasn’t hard.

2. Dialogue-based Multiple Choice
Example:
James: I don’t have a cell phone with me. Is there a public phone around?
David: Yes, there’s one by the entrance.
Question: What is James asking for?
a) He is asking for a private phone.
b) He is asking for a cell phone.
c) He is asking for a pay phone. (Correct)
d) He is asking for a service desk.

3. Gap-fill Multiple Choice
Example:
The officer acted ____ to control the situation, he didn’t hesitate.
a) immediately (Correct)
b) slowly
c) later
d) eventually

4. Underlined Target Word Multiple Choice
Example:
John, fill out the form before submitting it.
a) discuss
b) complete (Correct)
c) read
d) sent
`,

  2: `
Prompt 2: Opposites

Task: Create four types of vocabulary multiple-choice questions using “[word1] / [word2].”
The learner must identify the opposite word in each case.

1. Statement-based Opposite Multiple Choice
Example:
That child is very sad.
a) The child is not happy. (Correct)
b) The child is very happy.
c) The child is satisfied.
d) The child is very tired.

2. Dialogue-based Opposite Multiple Choice
Example:
John: Are we ahead of schedule?
Tom: Unfortunately, we’ve taken longer than expected.
Question:
A) They are currently behind schedule. (Correct)
B) They are still ahead of schedule.
C) They are making better progress than expected.
D) They are perfectly on schedule without delays.

3. Gap-fill Opposite Multiple Choice
Example:
You will find the book on the top shelf, not on the ____ shelf.
a) bottom (Correct)
b) top
c) horizontal
d) above

4. Underlined Target Word Opposite Multiple Choice
Example:
The road ahead was very straight.
a) It was curved.
b) It was not curved. (Correct)
c) It was not very straight.
d) It was a little busy.
`,

  3: `
Prompt 3: Definitions

Task: Create four definition-based multiple-choice questions using the word [word].
The goal is to test recognition of meaning and correct contextual use.

1. Statement-based Definition Multiple Choice
Example:
Someone who repairs water pipes and installs sinks and toilets.
a) plumber (Correct)
b) builder
c) carpenter
d) painter

2. Dialogue-based Definition Multiple Choice
Example:
Anna: The sink is leaking again!
Mark: I’ll call someone to fix it right away.
Question: Who will Mark probably call?
a) plumber (Correct)
b) driver
c) painter
d) teacher

3. Gap-fill Definition Multiple Choice
Example:
A ________ is someone who teaches students at a school.
a) doctor
b) teacher (Correct)
c) student
d) nurse

4. Underlined Target Word Definition Multiple Choice
Example:
The movie was very *thrilling*.
a) not interesting
b) full of excitement (Correct)
c) a little boring
d) extremely long
`,

  4: `
Prompt 4: Themes

Task: Create four types of vocabulary multiple-choice questions using nouns that fit into clear categories (bank, supermarket, library, church, hospital, stadium).
The goal is for learners to choose the correct thematic location or context.

1. Statement-based Theme Multiple Choice
Example:
Mark sat down in his favorite seat with armrests while reading his book near the window.
A) He sat on the carpet.
B) He sat in an armchair. (Correct)
C) He sat at the couch.
D) He sat on a large sofa.

2. Dialogue-based Theme Multiple Choice
Example:
Max: I wanted to buy a new coat, but the prices were too high at the department store.
Thomas: Maybe you should go to a store that sells items for lower prices.
Question:
Where does Thomas suggest to shop?
a) He should try shopping at a discount store. (Correct)
b) He suggests shopping at a luxury store.
c) She should go to an expensive department store.
d) She should try a vending machine for quick snacks.

3. Gap-fill Theme Multiple Choice
Example:
Tom set his ____ before going to bed so he wouldn’t be late for work.
a) alarm clock (Correct)
b) coat hanger
c) bedroom closet
d) electricity bill
`,

  5: `
Prompt 5: Grammar

Task: Create four grammar-based multiple-choice questions using a target grammar structure.
Learners must understand grammatical meaning and form.

1. Statement-based Grammar Multiple Choice
Example:
Of all the cars we tested, this one is the most expensive, but it’s also the least reliable.
Question: What does he say about the car?
a) It is the least expensive and the least reliable.
b) It is the most expensive but also the least reliable. (Correct)
c) It is the most reliable and the least expensive.
d) It is the least expensive but the most reliable.

2. Dialogue-based Grammar Multiple Choice
Example:
Mat: Tom, the coach told me that we needed to arrive at practice 15 minutes early tomorrow.
Tom: I guess we’ll need to leave home earlier than usual.
Question:
What did the coach tell Mat?
a) The coach told him they were arriving late to practice.
b) The coach told him they had to be there earlier tomorrow. (Correct)
c) The coach said him to came 15 minutes later.
d) The coach said them practice was early tomorrow.

3. Gap-fill Grammar Multiple Choice
Example:
Matthew arrived ____ today than he did yesterday.
a) early
b) earlyer
c) earlier (Correct)
d) more early

4. Sentence Order Grammar Multiple Choice
Example:
Choose the best sentence:
a) The library is open in 8 p.m.
b) The library are opens since 8 p.m.
c) The library opens at 8 a.m. (Correct)
d) The library is opens from 8 p.m.
`
};

// ---------------------------------------------------------------------------
// ✅ Build the full AI user prompt
// ---------------------------------------------------------------------------
function buildPrompt(promptType, word1, word2, definition, grammar) {
  const template = promptTemplates[promptType];
  switch (Number(promptType)) {
    case 1:
    case 2:
      return `${template}\n\nWord 1: ${word1}\nWord 2: ${word2}\n\nGenerate all four question types accordingly.`;
    case 3:
      return `${template}\n\nTarget Word: ${definition}\n\nGenerate all four question types accordingly.`;
    case 4:
      return `${template}\n\nTheme Nouns: ${word1}, ${word2}\n\nGenerate all three question types accordingly.`;
    case 5:
      return `${template}\n\nTarget Grammar Structure: ${grammar}\n\nGenerate all four question types accordingly.`;
    default:
      return "Invalid prompt type (choose 1–5).";
  }
}

// ---------------------------------------------------------------------------
// ✅ Generation Endpoint
// ---------------------------------------------------------------------------
app.post("/generate", async (req, res) => {
  try {
    const { promptType, word1, word2, definition, grammar } = req.body;
    const userPrompt = buildPrompt(promptType, word1, word2, definition, grammar);

    const completion = await client.chat.completions.create({
      model: "gpt-5",
      temperature: 1,
      messages: [
        {
          role: "system",
          content: `
You are an expert in language education and assessment design, with extensive experience in developing multiple-choice questions that effectively evaluate language functions, meanings, and structures.

Please ensure the task includes the following elements:
- Construct questions that test learners’ understanding of synonyms, language function comprehension, semantic meaning, and grammatical structures.
- For each language function, develop clear instructions accompanied by illustrative examples that align with best practices in language assessment.
- Design statement-based multiple-choice questions that present complete, natural sentences and plausible distractors.
- Specify the target learner proficiency level and the intended educational context to tailor the complexity and relevance of the questions.
- Maintain clarity, pedagogical soundness, and linguistic accuracy throughout the question design.

Additionally:
- One correct answer, one clearly wrong, and two plausible distractors.
- Only Section 3 (Gap-fill) may contain blanks (____).
- Output must be pedagogically sound and clearly formatted.
`
        },
        { role: "user", content: userPrompt }
      ]
    });

    res.json({
      ok: true,
      promptType,
      output: completion.choices[0].message.content.trim()
    });
  } catch (err) {
    console.error("💥 Error generating:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// ✅ Serve Frontend
// ---------------------------------------------------------------------------
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

// ---------------------------------------------------------------------------
// ✅ Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


