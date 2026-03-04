import { Panel, StoryInput } from './types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

interface GeminiTextResponse {
  candidates: Array<{
    content: { parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> };
  }>;
}

async function callGemini(
  model: string,
  prompt: string,
  responseModalities?: string[]
): Promise<GeminiTextResponse> {
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (responseModalities) {
    body.generationConfig = { responseModalities };
  }

  const res = await fetch(`${BASE_URL}/models/${model}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  return res.json();
}

export async function generateStory(
  input: StoryInput
): Promise<{ title: string; panels: Panel[] }> {
  const storyPrompt = `You are an anime story writer. Generate an engaging anime-style comic story.

Story Input:
- Character 1: ${input.character1Name} (${input.character1Role})
- Character 2: ${input.character2Name} (${input.character2Role})
- Background: ${input.background}
- Genre: ${input.genre}
${input.tone ? `- Tone: ${input.tone}` : ''}

Generate a story with exactly 5 comic panels. Return ONLY valid JSON with this exact structure:
{
  "title": "Story title here",
  "panels": [
    {
      "imageDescription": "Detailed visual description for this panel (anime art style, characters, setting, mood, colors)",
      "dialogue": "Character dialogue or speech (e.g., 'Character Name: ...dialogue...'). Empty string if no dialogue.",
      "narration": "Scene narration text describing what happens",
      "characterName": "Name of the main character in this panel"
    }
  ]
}

Make the story dramatic, emotional, and true to anime style. Include action, emotion, and plot twists.`;

  const response = await callGemini('gemini-2.0-flash', storyPrompt);
  const text = response.candidates[0]?.content.parts[0]?.text ?? '';

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  const parsed = JSON.parse(jsonStr.trim());
  return { title: parsed.title, panels: parsed.panels };
}

export async function generateCharacterImage(
  character: { name: string; role: string },
  genre: string
): Promise<string | null> {
  const prompt = `Generate an anime-style character portrait of ${character.name}, a ${character.role} in a ${genre} story.
Anime art style, vibrant colors, expressive eyes, detailed character design.
Show the character from shoulders up, dramatic lighting, high quality anime illustration.`;

  try {
    const response = await callGemini(
      'gemini-2.0-flash-preview-image-generation',
      prompt,
      ['IMAGE']
    );

    const imagePart = response.candidates[0]?.content.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch {
    return null;
  }
}
