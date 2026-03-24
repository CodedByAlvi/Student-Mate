// import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * FREE TIER VERSION:
 * This file has been modified to use mock responses instead of calling the Gemini API.
 * This ensures the app runs without requiring a paid API key or exceeding free quotas.
 */

export async function translateText(text: string, sourceLang: string, targetLang: string) {
  if (!text.trim()) return '';
  
  // Mock translation logic for demo purposes
  console.log(`[FREE TIER] Mocking translation from ${sourceLang} to ${targetLang}: ${text}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockTranslations: Record<string, string> = {
    'Hello': 'Hola',
    'How are you?': '¿Cómo estás?',
    'Good morning': 'Buenos días',
    'Thank you': 'Gracias',
    'Goodbye': 'Adiós',
  };

  // Simple mock logic: if it's a common phrase, return a known translation, otherwise return a placeholder
  if (targetLang === 'es') {
    return mockTranslations[text] || `[Mock Spanish] ${text}`;
  } else if (targetLang === 'bn') {
    return `[Mock Bangla] ${text}`;
  } else if (targetLang === 'fr') {
    return `[Mock French] ${text}`;
  }

  return `[Mock ${targetLang}] ${text}`;

  /* ORIGINAL PAID FEATURE (Commented out for free tier)
  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
  Only provide the translated text without any explanations or additional context.
  
  Text: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return response.text || 'Translation failed';
  } catch (error) {
    console.error('Translation error:', error);
    return 'Error during translation';
  }
  */
}

export async function textToSpeech(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') {
  if (!text.trim()) return null;

  console.log(`[FREE TIER] Mocking TTS for: ${text} with voice ${voiceName}`);
  
  // Return a generic placeholder audio or null for free tier
  // In a real free-tier app, you might use the browser's native SpeechSynthesis API
  return null;

  /* ORIGINAL PAID FEATURE (Commented out for free tier)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error('TTS error:', error);
    return null;
  }
  */
}
