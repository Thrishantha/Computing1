import formidable from "formidable";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

export const config = {
  api: {
    bodyParser: false, // 🔴 Required to parse FormData
  },
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form" });
    }

    const message = fields.message?.[0]; // Formidable returns arrays
    const file = files.file?.[0];

    console.log("📩 Message:", message);
    if (file) {
      console.log("📎 File uploaded:", file.originalFilename);
      // Optional: You could add logic to extract text from the file or analyze it
    }

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Ellangava Agro Chat, a helpful farming assistant who replies in Sinhala.",
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      });

      const reply = completion.data.choices?.[0]?.message?.content ?? "";
      return res.status(200).json({ reply });
    } catch (error) {
      console.error("OpenAI error:", error.response?.data || error.message);
      return res.status(500).json({ error: "OpenAI API error" });
    }
  });
}
