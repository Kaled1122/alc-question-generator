import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";


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
 Prompt 1: Synonyms

Task: Create four types of multiple-choice questions using the word pair “[word1] / [word2].”
The goal is to test learners’ understanding of synonym relationships and semantic similarity.

Output Format:
Section 1: Statement-based Multiple Choice
Section 2: Dialogue-based Multiple Choice
Section 3: Gap-fill Multiple Choice
Section 4: Underlined Target Word Multiple Choice
Each section must include:
- One clear example question
- Four labeled answer choices (a–d)
- Mark the correct answer with (Correct)
No extra explanations or context outside the questions.

Section 2 Examples (for reference style):
1.
Ryan: I didn’t see you at the meeting yesterday.
Adam: Yeah, I was absent because I wasn’t feeling well.
Question: What is Adam explaining?
a) He didn’t attend the meeting. (Correct)
b) He arrived late to the meeting.
c) He was the meeting host.
d) He forgot there was a meeting.

2.
Jake: You look exhausted. Want to rest for a while?
Noah: No, I’ll continue working until I finish.
Question: What will Noah probably do next?
a) Stop working and relax.
b) Keep working. (Correct)
c) Ask someone to help him.
d) Take a short break.

3.
Liam: The manager approved my vacation request!
Ethan: That’s great!
Question: What happened to Liam’s request?
a) It was accepted. (Correct)
b) It was rejected.
c) It was delayed.
d) It was ignored.
`,

  2: `
Prompt 2: Opposites

Task: Create four types of vocabulary multiple-choice questions using “[word1] / [word2].”
The learner must identify the opposite word in each case.

Output Format:
Section 1: Statement-based Multiple Choice
Section 2: Dialogue-based Multiple Choice
Section 3: Gap-fill Multiple Choice
Section 4: Underlined Target Word Multiple Choice
Each section must include:
- One clear example question
- Four labeled answer choices (a–d)
- Mark the correct answer with (Correct)
No extra explanations or context outside the questions.

Section 2 Examples (for reference style):
1.
Emma: The cafeteria is always noisy at lunch.
Sarah: Really? I prefer a quiet place to eat.
Question: What does Sarah want?
a) A place with less noise. (Correct)
b) A bigger cafeteria.
c) A place with more people.
d) A shorter lunch break.

2.
Tom: Should we drive there tonight?
Mark: No, it’s too dark now. Let’s go in the morning.
Question: What is Mark suggesting?
a) They should leave in the morning. (Correct)
b) They should go tonight.
c) They should cancel the trip.
d) They should call a taxi.

3.
Lisa: I think this test is easy.
Nora: Are you kidding? It’s hard!
Question: What is Nora’s opinion?
a) The test is difficult. (Correct)
b) The test is fair.
c) The test is long.
d) The test is short.
`,

  3: `
Prompt 3: Definitions

Task: Create four definition-based multiple-choice questions using “[word].”
The goal is to test recognition of meaning and correct contextual use.

Output Format:
Section 1: Statement-based Multiple Choice
Section 2: Dialogue-based Multiple Choice
Section 3: Gap-fill Multiple Choice
Section 4: Underlined Target Word Multiple Choice
Each section must include:
- One clear example question
- Four labeled answer choices (a–d)
- Mark the correct answer with (Correct)
No extra explanations or context outside the questions.

Section 2 Examples (for reference style):
1.
Emma: The kitchen sink is leaking again!
John: I’ll call a plumber.
Question: What will John probably do next?
a) Call someone to fix the leak. (Correct)
b) Call a driver.
c) Buy a new sink.
d) Complain to the neighbors.

2.
Mia: I’m going to the pharmacy.
Noah: Why?
Mia: To get my medicine.
Question: Where is Mia going?
a) To buy medicine. (Correct)
b) To meet her doctor.
c) To visit her friend.
d) To pay her bill.

3.
Sophia: The air conditioner isn’t working again.
Liam: We’ll need a technician.
Question: What will they probably do?
a) Call someone to repair it. (Correct)
b) Turn it off completely.
c) Buy a fan instead.
d) Wait for it to cool down.
`,

  4: `
Prompt 4: Themes

Task: Create four types of vocabulary multiple-choice questions using nouns that fit into clear categories (bank, supermarket, library, hospital, etc.).
The goal is for learners to choose the correct thematic location or context.

Output Format:
Section 1: Statement-based Multiple Choice
Section 2: Dialogue-based Multiple Choice
Section 3: Gap-fill Multiple Choice
Section 4: Underlined Target Word Multiple Choice
Each section must include:
- One clear example question
- Four labeled answer choices (a–d)
- Mark the correct answer with (Correct)
No extra explanations or context outside the questions.

Section 2 Examples (for reference style):
1.
Jake: I’d like to withdraw some cash, please.
Teller: Sure, fill out this form.
Question: Where is Jake?
a) At a bank. (Correct)
b) At a restaurant.
c) At a school.
d) At a library.

2.
Maria: Can you check my blood pressure?
Nurse: Of course. Please sit here.
Question: Where is this conversation taking place?
a) In a hospital. (Correct)
b) In a supermarket.
c) In a post office.
d) In a classroom.

3.
Henry: The shelves are full of fresh bread today.
Clerk: It’s from the new bakery supplier.
Question: What type of place are they in?
a) A supermarket. (Correct)
b) A hospital.
c) A gym.
d) A factory.
`,

  5: `
Prompt 5: Grammar

Task: Create four grammar-based multiple-choice questions using a target grammar structure.
Learners must understand grammatical meaning and form.

Output Format:
Section 1: Statement-based Multiple Choice
Section 2: Dialogue-based Multiple Choice
Section 3: Gap-fill Multiple Choice
Section 4: Underlined Target Word Multiple Choice
Each section must include:
- One clear example question
- Four labeled answer choices (a–d)
- Mark the correct answer with (Correct)
No extra explanations or context outside the questions.

Section 2 Examples (for reference style):
1.
Tom: The coach said we need to arrive earlier tomorrow.
Max: So we should leave home sooner than usual.
Question: What is Tom suggesting?
a) They should arrive before the usual time. (Correct)
b) They can come later than usual.
c) They don’t have practice tomorrow.
d) They should cancel practice.

2.
Sally: I have never tried sushi before.
Emma: Really? Let’s go tonight!
Question: What does Sally mean?
a) She hasn’t eaten sushi before. (Correct)
b) She eats sushi often.
c) She dislikes sushi.
d) She already went last week.

3.
Paul: If it rains, the picnic will be canceled.
Tim: Then I hope for sunshine!
Question: What will happen if it rains?
a) The picnic will be canceled. (Correct)
b) The picnic will continue.
c) They’ll move it indoors.
d) They’ll delay it by an hour.
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
You are a senior Language Assessment Designer specializing in advanced ESL testing and question development.

You will generate **multiple-choice questions** (MCQs) for **upper-intermediate to advanced learners (CEFR B2–C2)** in **academic and professional contexts**.  
Your tasks focus on: vocabulary depth, grammar precision, semantic nuance, and contextual understanding.

Strict design standards:
- **Question Type Coverage:** Always include all required sections (Statement-based, Dialogue-based, Gap-fill, and Underlined Target Word).
- **Register:** Use natural, authentic English (no textbook-like tone).
- **Difficulty:** Reflect CEFR B2–C2 cognitive demand — include subtle meaning contrasts, collocations, and academic phrasing.
- **Clarity:** Avoid overly simple words (e.g., “happy,” “big,” “good”). Use advanced yet teachable vocabulary.
- **Format discipline:** 
  - Each section must have one example question only.
  - Each question must have 4 labeled choices (a–d).
  - Mark the correct choice with “(Correct)” exactly.
  - No explanations, notes, or summaries beyond the questions.

Dialogue design rules:
- Write natural two-person conversations (male and female names are fine, keep tone formal-casual).
- Dialogue-based comprehension questions must sound natural and realistic, e.g.:
  - “What is Tom suggesting?”
  - “What will Jake probably do next?”
  - “What problem are they discussing?”
  - “Where is this conversation taking place?”
- Avoid meta or interpretive questions such as:
  - “What does Emma mean by ‘engaging’?”
  - “What is the meaning of the underlined word?”
  - “Which word means the same as…?”

Content relevance:
- Grammar prompts: Use accurate examples of tense, aspect, comparatives, conditionals, or relative clauses.
- Synonyms & opposites: Use lexical items typical of academic or workplace English (e.g., “mitigate / alleviate,” “scarce / abundant”).
- Definitions: Center on precise usage or occupational terminology.
- Themes: Keep realism — bank, hospital, university, meeting, workplace, etc.

Overall constraints:
- Maintain pedagogical clarity, linguistic authenticity, and assessment fairness.
- Output **only** the formatted questions and choices. No commentary or metadata.
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








