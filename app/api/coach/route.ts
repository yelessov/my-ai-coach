import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { history, apiKey } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: "No API Key provided" }, { status: 400 });
  }

  const prompt = `
    Act as a pro Kinesiologist. Analyze this DUP workout history:
    ${JSON.stringify(history.slice(-10))}
    
    Give a 2-sentence analysis: 
    1. Are they plateauing or progressing? 
    2. One specific tip for the next "Strength" session.
    Keep it strictly under 50 words.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const advice = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ advice });
  } catch (error) {
    return NextResponse.json({ error: "AI Coach is offline." }, { status: 500 });
  }
}