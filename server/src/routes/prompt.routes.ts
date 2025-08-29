import { Request, Response, Router } from "express";
import { Template } from "../models/Template";
import axios from "axios";
import { convertPolotnoJSONToImage, filterTemplates, updatePolotnoChildren } from "../utils/polotno";

const router = Router();

router.put('/prompts', (req: Request, res: Response) => {
  res.status(200).json({ msg: "Okay!" });
})

router.post('/', async (req: Request, res: Response) => {
  try {

    const geminiPromptTemplate = `
        You are a specialized Graphic Design AI, an expert in enhancing Polotno design templates. Your primary objective is to intelligently modify a design template based on a user's request, ensuring all changes are aesthetically pleasing, contextually relevant, and technically sound within the template's constraints.
        
        PRIMARY OBJECTIVE: To receive a design template's data and a user request, and return a precise JSON array of modifications.
        
        **INPUTS**
        You will be provided with the following:
        1. canvasData: A simplified JSON object representing the template's elements. Crucially, this includes width, height, and fontSize for each text element, which you MUST use for your calculations.
        2. originalPalette: An array of the original colors (in hex or rgb format) used in the template, which serve as the keys for color replacement.
        3. currentReplacements: An optional JSON object mapping original colors to their current rgba replacement values. You will modify this object.
        4. keyTextElements: A list of important text elements with their current values, to help you identify their purpose.
        5. designContext: A brief description of the template's purpose and visual style (e.g., "A modern real estate listing flyer").
        6. userRequest: The user's desired changes in plain English.
        
        **CORE INSTRUCTIONS & THOUGHT PROCESS**
        Before generating the output, you must follow this internal thought process:
        
        Step 1: Deconstruct the Request & Context:
          * Thoroughly analyze the userRequest. Identify the core intent: Is it a change of theme, content, or both?
          * Analyze the designContext and keyTextElements to understand the purpose of each part of the template (e.g., which text is a headline, which is a body, which is a call-to-action).
        
        Step 2: Develop a Modification Plan (Internal Monologue)
          This is the most critical step. You will formulate a plan for both text and color changes.
          
          A. Text Modification Strategy (Priority: NO OVERFLOW)
            Your absolute priority is to ensure new text fits perfectly within its designated width and height without overflowing.
            1. Identify Target Text: Match the user's requested text changes (e.g., "123 Oak Street," "$450,000") to the corresponding elements in keyTextElements and canvasData.
            2. Assess the Space: For each text element you need to change, note its width, height, and original fontSize.
            3. Generate Candidate Text: Create the new text string based on the user's request.
            4. Apply Fitting Logic (in this order):
              * Concise Wording: First, try to make the text more concise while retaining the meaning. (e.g., "Available for Sale" -> "For Sale").
              * Line Breaks: If the text is long, strategically insert line breaks (\\n) to make it fit the element's height and width.
              * Font Size Reduction (Last Resort): Only if the text still doesn't fit after applying line breaks, calculate an appropriate fontSize reduction. A 5-20% reduction is typical. Never go below the minimum readable size of 12. You must perform a rough mental calculation to justify the new font size.
              * Maintain Style: Ensure the new text matches the capitalization and style of the original (e.g., 'SOLD' -> 'FOR RENT', not 'For rent'). Format prices, dates, and phone numbers appropriately.
          
          B. Color Modification Strategy (CRITICAL: CONTRAST & PALETTE ADHERENCE)
            1. Identify Color Roles: Look at the originalPalette and how colors are used in the template. Mentally label them (e.g., rgb(0, 161, 255) is the primary/accent color, rgb(65,65,67,1) is the background/dark color).
            2. Create a Cohesive New Palette: Based on the user's theme request (e.g., "blue theme"), devise a new, harmonious color palette that:
               * Uses colors ONLY from the provided originalPalette as reference points
               * Maintains the same color relationships and hierarchy as the original
               * Ensures proper contrast ratios (minimum 4.5:1 for text/background pairs)
               * Creates a cohesive color story that matches the requested theme
            3. Advanced Color Mapping Rules:
               * Primary colors should shift to the new theme's primary color family
               * Secondary colors should be complementary or analogous to your new primary
               * Neutral colors (grays, blacks, whites) should be adjusted to support the new palette
               * Maintain color temperature consistency (warm themes use warm colors, cool themes use cool colors)
            4. Contrast Validation: For every color replacement, mentally verify that:
               * Text remains readable against its background
               * Important elements maintain sufficient visual separation
               * The overall design retains proper visual hierarchy
            5. Map Colors: Update the colorsReplace object by mapping the original colors (the keys) to your new rgba values (the values). 
            6. Efficiency: Only include colors in the colorsReplace object that are actually being changed. If a color is meant to revert to its original, remove its entry from the map.

        Step 3: Generate the Final JSON Output
          1. Translate your modification plan into the required JSON array format.
          2. Only include properties that have been changed for each element ID.
          3. Include background changes when the user requests a comprehensive theme change.
          4. Double-check all values against the validation requirements.
        

        **OUTPUT FORMAT REQUIREMENTS**
          Your response MUST BE a valid JSON array containing objects in these formats:
          
          For element modifications:
          {
            "id": "element_id",
            "properties": {
              "text": "new text content",           // Only if text is being changed
              "fontSize": 45,                     // Only if font size needs adjustment
              "colorsReplace": {                   // Only if colors are being changed
                "original_color": "rgba(r,g,b,a)"  // Map original palette colors to new colors
              },
              "opacity": 0.8                      // Only if transparency needs adjustment
            }
          }
          
          For background modifications (when comprehensive theme changes are requested):
          {
            "page_id": "page_identifier_string",
            "background": "color_value"          // Use standard color names, hex, or rgba format
          }

        **VALIDATION & FORMATTING RULES**
          * Output Format: Your response MUST BE a valid JSON array of objects, and nothing else. No explanations, no markdown.
          * Color Format: All color values in colorsReplace MUST be in the rgba(r,g,b,a) format.
          * Font Size: fontSize must be a number, with a minimum value of 12.
          * Opacity: opacity must be a number between 0 and 1.
          * IDs: The id in your response must exactly match the id from the input canvasData.
          * Background: Only include background changes when the user request implies a comprehensive design overhaul.
        
        **Example of your thought process for a color theme change:**
          User wants to change to a "professional dark theme".
          1. Analyze originalPalette: rgb(0, 161, 255) is bright blue (accent), rgb(255,255,255) is white (text/background), rgb(65,65,67) is dark gray.
          2. For dark theme: I need a dark background, light text, and a refined accent color.
          3. Color mapping: rgb(0, 161, 255) -> rgba(70, 130, 200, 1) (muted professional blue), rgb(255,255,255) -> rgba(240, 240, 240, 1) (off-white for readability), rgb(65,65,67) -> rgba(25, 25, 25, 1) (deep dark).
          4. Contrast check: Light text on dark background = good contrast. Muted blue on dark = sufficient contrast.
          5. Background: Change to dark color for comprehensive theme shift.

        **Example of your thought process for a text change:**
          User wants to change "SOLD" to "NOW LEASING".
          1. Target element id: "YybgFTBnJq" has text "SOLD". Dimensions are width: 310, height: 373, fontSize: 310.
          2. The new text "NOW LEASING" is significantly longer than "SOLD".
          3. At fontSize: 310, it will definitely overflow the width: 310 box.
          4. Line breaks won't work well for this large, single-line text.
          5. I must reduce the font size. Original length is 4 chars, new is 11. That's about 2.75x longer. I'll reduce the font size proportionally. 310 / 2.75 is roughly 112. Let's try fontSize: 120. This seems reasonable and will fit.
          6. Plan: Change text to "NOW LEASING" and fontSize to 120.

        (Begin Task)
      `;
      
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const templateId = '68a875cf04311897ff06380e';
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const { colorPalette, demoText, templates } = await filterTemplates([template.canvasData]);


    const fullPrompt = `
      ${geminiPromptTemplate}

      **Original Template Data:**
      ${JSON.stringify(templates, null, 2)}

      **Color Palette:**
      ${JSON.stringify(colorPalette, null, 2)}

      **Demo Text:**
      ${JSON.stringify(demoText, null, 2)}

      **User Request:** "${prompt}"

      **Response (JSON array only):
    `;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    
    const base64Template = await convertPolotnoJSONToImage({ polotnoJSON: template.canvasData, templateId })


    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt.trim(),
        }, {
          inline_data: {
            mime_type: `image/png`,
            data: base64Template
          }
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 20192
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
    const modifiedChildren = JSON.parse(cleanJsonResponse(generatedText));


    console.log('\n\n modifiedChildren : ', modifiedChildren);

    const modifiedCanvasData = updatePolotnoChildren(template.canvasData, modifiedChildren)

    console.log('\n\n modifiedCanvasData : ', modifiedCanvasData);

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
  text = text.replace(/`/g, '');
  // Remove any leading/trailing whitespace
  text = text.trim();

  // Find the first { and last } to extract just the JSON object
  // const firstBrace = text.indexOf('{');
  // const lastBrace = text.lastIndexOf('}');

  // if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
  //   text = text.substring(firstBrace, lastBrace + 1);
  // }

  return text;
}

/**

```json
[
  {
    "id": "svg_element_0",
    "properties": {
      "colorsReplace": {
        "rgb(0, 161, 255)": "rgba(0, 86, 179, 1)"
      }
    }
  },
  {
    "id": "svg_element_1",
    "properties": {
      "colorsReplace": {
        "rgb(0, 161, 255)": "rgba(0, 123, 255, 1)"
      }
    }
  },
  {
    "id": "YybgFTBnJq",
    "properties": {
      "text": "123 Oak Street",
      "fontSize": 90
    }
  },
  {
    "id": "6VZX8W4rYS",
    "properties": {
      "text": "$450,000",
      "fontSize": 45
    }
  },
  {
    "id": "svg_element_4",
    "properties": {
      "colorsReplace": {
        "rgb(0, 161, 255)": "rgba(0, 123, 255, 1)"
      }
    }
  }
]







 [
 {
   "id": "svg_element_0",
   "properties": {
     "colorsReplace": {
       "rgb(0, 161, 255)": "rgba(0, 86, 179, 1)"
     }
   }
 },
 {
   "id": "svg_element_1",
   "properties": {
     "colorsReplace": {
       "rgb(0, 161, 255)": "rgba(0, 123, 255, 1)"
     }
   }
 },
 {
   "id": "YybgFTBnJq",
   "properties": {
     "text": "123 Oak Street",
     "fontSize": 264.248
   }
 },
 {
   "id": "6VZX8W4rYS",
   "properties": {
     "text": "$450,000"
   }
 },
 {
   "id": "svg_element_4",
   "properties": {
     "colorsReplace": {
       "rgb(0, 161, 255)": "rgba(0, 123, 255, 1)"
     }
   }
 }
]



```



    [
      {
        "id": "7vVQFlGYW1_0",
        "properties": {
          "colorsReplace": {
            "rgb(0, 161, 255)": "rgba(30, 144, 255, 1)"
          }
        }
      },
      {
        "id": "7vVQFlGYW1_1",
        "properties": {
          "colorsReplace": {
            "rgb(0, 161, 255)": "rgba(30, 144, 255, 1)"
          }
        }
      },
      {
        "id": "YybgFTBnJq",
        "properties": {
          "text": "123 Oak Street",
          "fontSize": 124.352
        }
      },
      {
        "id": "6VZX8W4rYS",
        "properties": {
          "text": "$450,000",
          "fontSize": 75.885
        }
      },
      {
        "id": "7vVQFlGYW1_4",
        "properties": {
          "colorsReplace": {
            "rgb(0, 161, 255)": "rgba(30, 144, 255, 1)"
          }
        }
      }
    ]

 */


export default router;