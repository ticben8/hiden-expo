
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateExhibitionIntro() {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'اكتب مقدمة شاعرية قصيرة لمعرض فني عن زيت الزيتون التونسي يسمى "ما لا يرى في الزيت"، يركز على الروح والذاكرة والتراث.',
  });
  return response.text;
}

export async function analyzeVisitorReflections(userComment: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `بصفتك منسق معارض، علق على انطباع زائر قال: "${userComment}" عن معرض زيت الزيتون. اجعل الرد ملهماً وفنياً.`,
  });
  return response.text;
}
