"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const suggestions = [
    "මට වගා ගැන ප්‍රශ්නයක් තියෙනවා.",
    "මෙම ගෙවතුට විශේෂඥ උදව් අවශ්‍යයි.",
    "ඔබගේ අත්දැකීම එක් කරන්න.",
    "මේ පිළිබඳ ඔබගේ අදහස කුමක්ද?"
  ];

  const handleSuggestion = (text: string) => setInput(text);

  const handleSend = async () => {
    if (!input.trim() && !file) {
      setMessages(prev => [...prev, "❗කරුණාකර පණිවිඩයක් හෝ ගොනුවක් ඇතුළත් කරන්න."]);
      return;
    }
    const formData = new FormData();
    if (input.trim()) formData.append("message", input);
    if (file) formData.append("file", file);

    setMessages(prev => [...prev, `👨‍🌾 ${input}${file ? " 📎" : ""}`, "🤖 පිළිතුර ලැබෙමින්..."]);
    setInput(""); setFile(null);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        console.error("Server Error:", data);
        setMessages(prev => [...prev.slice(0, -1), `❌ දෝෂයක්: ${data.error || "පිළිතුර ලබා ගැනීම අසාර්ථක විය."}`]);
        return;
      }
      setMessages(prev => [...prev.slice(0, -1), `🤖 ${data.reply?.trim() || "(පිළිතුර හිස්ව ඇත)"}`]);
    } catch (err) {
      console.error("Network error:", err);
      setMessages(prev => [...prev.slice(0, -1), "❌ ජාල දෝෂයක්: පිළිතුර ලබා ගත නොහැකිය."]);
    }
  };

  const startVoice = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "si-LK";
    recognition.start();
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-[#f7f7f7]">
      <h1 className="text-2xl mb-4 font-bold">Ellangava Agro Chat</h1>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 mb-4 max-w-md">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestion(s)}
            className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat History */}
      <div className="w-full max-w-md bg-white rounded shadow p-4 mb-4 overflow-y-auto h-96">
        {messages.map((msg, idx) => <p key={idx} className="mb-2 whitespace-pre-wrap">{msg}</p>)}
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <input
          type="text"
          placeholder="ඔබේ ප්‍රශ්නය..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2"
        />
        <input type="file" accept=".pdf,.txt,.docx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex gap-2">
          <button onClick={startVoice} className="bg-blue-500 text-white px-4 py-2 rounded">🎤 කතා කරන්න</button>
          <button onClick={handleSend} className="bg-green-600 text-white px-4 py-2 rounded flex-1">යවන්න</button>
        </div>
      </div>
    </div>
  );
}
