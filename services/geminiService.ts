import { GoogleGenAI } from "@google/genai";
import { NewsTemplate } from "../types";
import { getTemplateReferenceImage } from "./templateUtils";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Step 1: Generate a caption based on the image and user context.
 */
export const generateCaption = async (base64Image: string, userContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          {
            text: `You are a social media editor. Write a short, engaging headline (caption) for this image. 
            Topic: "${userContext}".
            Rules: Max 12 words. Catchy. Return ONLY the text.`
          }
        ]
      }
    });

    return response.text?.trim() || "Error generating caption";
  } catch (error) {
    console.error("Caption generation failed:", error);
    throw error;
  }
};

/**
 * Step 2: Composite the image using a VISUAL TEMPLATE reference.
 * We pass two images: 
 * 1. The User's Source Photo (Content Reference)
 * 2. The Template Layout (Style Reference)
 */
export const generateAssetWithTemplate = async (
  base64SourceImage: string,
  caption: string,
  template: NewsTemplate
): Promise<string> => {
  try {
    // 1. Generate/Fetch the visual template "file"
    const templateDataUrl = await getTemplateReferenceImage(template);
    const base64Template = templateDataUrl.split(',')[1];

    const prompt = `
      You are an expert graphic designer and image compositor.
      
      INPUTS:
      [Image 1]: The CONTENT IMAGE (The news photograph).
      [Image 2]: The LAYOUT TEMPLATE (The graphical overlay, borders, and style).
      
      TASK:
      Create a final social media asset by overlaying the LAYOUT TEMPLATE onto the CONTENT IMAGE.
      
      STRICT INSTRUCTIONS:
      1. PRESERVE CONTENT: Use [Image 1] as the base. Do not alter the reality of the scene in [Image 1].
      2. APPLY TEMPLATE: Superimpose the graphical elements (banners, color bars, frames) exactly as they appear in [Image 2] onto [Image 1].
      3. TEXT PLACEMENT: Render the caption text: "${caption}" inside the designated text area defined by the template (usually the banner or bottom bar).
      4. STYLE MATCH: Ensure the fonts and colors match the [Image 2] style.
      
      OUTPUT:
      A single high-quality image that looks like [Image 1] wrapped in the design of [Image 2].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          // Source Image (First)
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64SourceImage
            }
          },
          // Template Reference Image (Second)
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Template
            }
          },
          // Instructions
          {
            text: prompt
          }
        ]
      },
      config: {
        // Enforce 1:1 aspect ratio to match our generated templates and ensure consistent layout mapping
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error(`Asset generation failed for template ${template.name}:`, error);
    throw error;
  }
};
