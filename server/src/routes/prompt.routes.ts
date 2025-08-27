import { Request, Response, Router } from "express";
import { Template } from "../models/Template";
import axios from "axios";
import { convertPolotnoJSONToImage } from "../utils/polotno";

const router = Router();

router.put('/prompts', (req: Request, res: Response)=> {
  res.status(200).json({ msg: "Okay!" });
})

router.post('/', async (req: Request, res: Response) => {
  try {

    const geminiPromptTemplate = `
      You are an expert AI assistant specializing in design and content generation. Your task is to take a user prompt and a design template's JSON data (canvasData), and intelligently modify the canvasData based on the user's request. Your goal is to produce a new, well-structured, and realistic JSON object that maintains the original design's integrity while applying the new content and theme.

      **Instructions:**

      1.  **Analyze and Understand the User Prompt:**
          * Identify the core theme or request (e.g., "real estate," "blue theme," "modern home," "event flyer").
          * Extract key information like a primary color, text to be replaced (e.g., a specific price or address), or content type.

      2.  **Process canvasData:**
          * **Identify Modifiable Elements:** Look for text objects (type: 'i-text'), background colors, and other relevant fields.
          * **Smart Replacement Logic:**
              * Content Analysis: Identify content type: price, address, description, title.
              * Replacement Strategy:
                  * Primary content (titles, prices): Direct replacement based on user input.
                  * Secondary content (descriptions): Generate relevant placeholder text or use provided text.
                  * Accent content (contact info): Format appropriately (e.g., phone numbers).
              * Relationship Mapping:
                  * If price changes, ensure currency symbols match.
                  * If theme changes, update ALL color references.
                  * If address changes, update related location references.

      3.  **Apply Color and Style Changes:**
          * Step 1: Color Palette Generation:
              * Primary color: [from user prompt or inferred]
              * Secondary color: [complementary/analogous]
              * Accent color: [for highlights]
              * Text colors: [high contrast variants]
              * Background colors: [lighter/darker variants]
          * Step 2: Accessibility Check:
              * Ensure minimum 4.5:1 contrast ratio for normal text.
              * Ensure minimum 3:1 contrast ratio for large text.
              * If contrast is insufficient, automatically adjust brightness.
          * Step 3: Color Application Rules:
              * Headers/titles: Primary or high-contrast color.
              * Body text: Dark neutral with sufficient contrast.
              * Backgrounds: Light variants or white.
              * Accents: Secondary/accent colors.
              * Price/important info: Accent color for emphasis.

      4.  **Implement Text Fitting Intelligence:**
          * Calculate text length vs. available space: If new text is >20% longer than original, reduce fontSize by 10-15% (maintain minimum readable size of 12px).
          * Formatting Rules:
              * For prices: Use consistent currency symbols and appropriate number formatting (e.g., $3,000,000).
              * For addresses: Break long addresses into multiple lines if needed.
              * For dates: Format consistently (e.g., Month DD, YYYY).

      5.  **Perform Validation Checklist (before returning final JSON):**
          * Color Format Check: All colors in valid rgba(r,g,b,a) or hex format.
          * Text Boundary Check: Calculate approximate text width to ensure it fits within its container.
          * Consistency Check: Similar text elements use similar font sizes; color theme applied consistently.
          * JSON Structure Check: All required properties present, no broken syntax.

      6.  **Final Output:**
          * Return the *complete, modified canvasData JSON object only*. Do not include any extra text, explanations, or code blocks in the response. The JSON must be a single, valid JSON object.
      `;

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const templateId = '68a875cf04311897ff063810';
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const canvasData = JSON.stringify(template.canvasData);

    const fullPrompt = `
      ${geminiPromptTemplate}

      **Original canvasData JSON:**
      
      ${canvasData}
      
      **User Request:** "${prompt}"
      
      **Final Output JSON (modified canvasData):**
    `;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log('Calling gemini', process.env.GEMINI_API_KEY);

    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt.trim()
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GEMINI_API_KEY,
    };

    const response = await axios.post(url, requestBody, { headers });
    
    // Extract the generated text from the response
    const generatedText = response.data.candidates[0].content.parts[0].text;

    console.log(generatedText)

    // Try to parse the JSON response
    const modifiedCanvasData = JSON.parse(cleanJsonResponse(generatedText));


    console.log('\n\n', modifiedCanvasData);


    await convertPolotnoJSONToImage({ polotnoJSON: modifiedCanvasData, templateId })

    res.json(modifiedCanvasData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed', err });
  }
})


function cleanJsonResponse(text: string) {
  // Remove markdown code blocks
  text = text.replace(/```json\s*/gi, '');
  
  // Remove any leading/trailing whitespace
  text = text.trim();
  
  // Find the first { and last } to extract just the JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }
  
  return text;
}

export default router;