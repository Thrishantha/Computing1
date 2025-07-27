import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import formidable from "formidable";
import { Readable } from "stream";

// Required to prevent Next.js from parsing the body
export const config = {
  api: { bodyParser: false },
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Helper to convert the incoming request into a stream for Formidable
async function bufferToStream(req: Request): Promise<Readable> {
  const reader = req.body?.getReader();
  const stream = new Readable({
    async read() {
      if (!reader) return this.push(null);
      const { done, value } = await reader.read();
      this.push(done ? null : value);
    },
  });
  return stream;
}

export async function POST(req: Request) {
  const form = new formidable.IncomingForm();

  return new Promise(async (resolve) => {
    const stream = await bufferToStream(req);

    form.parse(stream as any, async (err, fields, files) => {
      if (err) {
        console.error("❌ Form parse error:", err);
        return resolve(
          NextResponse.json({ error: "Form parsing failed" }, { status: 500 })
        );
      }

      const message = fields.message?.[0];
      if (!message) {
        return resolve(
          NextResponse.json({ error: "No message" }, { status: 400 })
        );
      }

      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are Ellangava Agro Chat, a helpful agricultural assistant who answers in Sinhala.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        });

        const reply = completion.data.choices[0].message?.content || "";
        return resolve(NextResponse.json({ reply }));
      } catch (error) {
        console.error("❌ OpenAI error:", error);
        return resolve(
          NextResponse.json({ error: "OpenAI call failed" }, { status: 500 })
        );
      }
    });
  });
}
