import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message");

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "පණිවිඩයක් ලබා දී නොමැත" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Ellangava Agro Chat, a helpful agriculture assistant who answers concisely in Sinhala (සිංහල භාෂාවෙන් පිළිතුරු සපයන්න). Avoid unnecessary repetition.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "(පිළිතුර හිස්ව ඇත)";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("OpenAI error:", err?.message || err);
    return NextResponse.json({ error: "OpenAI call failed" }, { status: 500 });
  }
}
