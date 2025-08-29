import fs from 'fs';
import { createInstance, PolotnoInstance } from 'polotno-node';
import puppeteer from 'puppeteer';
import { IPolotnoChild, IPolotnoJSON, IPolotnoPage } from '../types/polotno';
import { DOMParser } from 'xmldom'


let polotnoInstance: PolotnoInstance;

export async function getPolotnoInstance() {

  if (polotnoInstance) {
    return polotnoInstance;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  })

  const instance = await createInstance({
    //! this is a demo key just for that project
    // (!) please don't use it in your projects
    // to create your own API key please go here: https://polotno.dev/cabinet
    key: 'nFA5H9elEytDyPyvKL7T',
    browser,
    url: 'https://studio.polotno.com/',
    // waitForFonts: true,
    // timeout: 30000,
    //@ts-ignore
    requestInterceptor: (request) => {
      const targetUrl = request.url();
      if (/\.(png|jpe?g)(\?|$)/i.test(targetUrl)) {
        console.log(`Modifying User-Agent for image request: ${targetUrl}`);
        request.continue({
          headers: {
            ...request.headers(),
            'User-Agent': 'MyCustomApprovedAgent/1.0',
          },
        });
      } else {
        request.continue();
      }
    },
  });

  polotnoInstance = instance;
  return instance;
}


export async function randomName(polotnoJSON: any) {
  const instance = await createInstance({
    // this is a demo key just for that project
    // (!) please don't use it in your projects
    // to create your own API key please go here: https://polotno.dev/cabinet
    key: 'nFA5H9elEytDyPyvKL7T',
  });

  // load sample json
  // const json = JSON.parse();

  console.log(polotnoJSON);

  const imageBase64 = await instance.jsonToImageBase64(polotnoJSON);
  fs.writeFileSync('out.png', imageBase64, 'base64');

  // close instance
  instance.close();
}

export async function convertPolotnoJSONToImage({
  templateId,
  polotnoJSON,
  quality = 1,
  format = 'png'
}: { templateId: string, polotnoJSON: any, quality?: number, format?: string }) {
  try {
    // Get the shared instance
    const instance = await getPolotnoInstance();
    console.log('\n\n', polotnoJSON)

    // Convert JSON to base64 image using polotno-node method
    const imageBase64 = await instance.jsonToImageBase64(polotnoJSON);


    // Generate filename with your required format
    const timestamp = Date.now();
    const filename = `preview_img_${templateId}_${timestamp}_quality.png`;

    // Save image to file (remove data:image prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filename, base64Data, 'base64');

    console.log(`Image saved: ${filename}`);
    return base64Data;

  } catch (error) {
    console.error('Error converting polotnoJSON to image:', error);
    throw error;
  }
  // No need to close instance here - it's reused
}


type ElementType = "svg" | "text";


interface ProcessedData {
  templates: IPolotnoJSON[];
  colorPalette: string[];
  demoText: any[];
}

export const filterTemplates = async (templates: IPolotnoJSON[]): Promise<ProcessedData> => {
  const colorPalette = new Set<string>();
  const demoText: any[] = [];

  const newTemplates = templates.map(template => {
    const newPages = template.pages.map(page => {
      const newChildren = page.children
        .filter(child => ["svg", "text"].includes(child.type))
        .map(child => {
          if (child.type === "svg") {
            const svgFields = [
              "borderColor", "borderSize", "colorsReplace", "height", "width",
              "opacity", "shadowColor", "x", "y", "id"
            ];
            const newSvg: Partial<IPolotnoChild> = {};
            svgFields.forEach(field => {
              if (field in child) {
                newSvg[field] = child[field];
              }
            });
            newSvg.type = child.type;
            newSvg['originalSVGColors'] = extractColorsFromSvg(child['src'])
            // Extract colors from colorsReplace for the color palette
            if (child.colorsReplace) {
              Object.values(child.colorsReplace).forEach((color) => {
                colorPalette.add(color as string);
              });
            }
            // Extract colors from borderColor and shadowColor
            if (child.borderColor) colorPalette.add(child.borderColor);
            if (child.shadowColor) colorPalette.add(child.shadowColor);

            return newSvg as IPolotnoChild;

          } else if (child.type === "text") {
            const textFields = [
              "x", "y", "width", "height", "text", "align", "fill",
              "fontFamily", "fontSize", "fontStyle", "fontWeight",
              "letterSpacing", "opacity", "shadowColor", "textDecoration"
            ];
            const newText: Partial<IPolotnoChild> = {};
            textFields.forEach(field => {
              if (field in child) {
                newText[field] = child[field];
              }
            });
            newText.type = child.type;

            // Extract text and related properties for demoText
            if (child.text && child.id && child.fontSize) {
              demoText.push({
                text: child.text,
                id: child.id,
                fontSize: child.fontSize,
                width: child.width,
                height: child.height,
                fontWeight: child.fontWeight,
              });
            }
            // Extract colors from fill, borderColor, and shadowColor
            if (child.fill) colorPalette.add(child.fill);
            if (child.borderColor) colorPalette.add(child.borderColor);
            if (child.shadowColor) colorPalette.add(child.shadowColor);

            return newText as IPolotnoChild;
          }
          return child;
        });

      colorPalette.add(page.background)
      return { ...page, children: newChildren };
    });
    return { ...template, pages: newPages };
  });

  return {
    templates: newTemplates,
    colorPalette: Array.from(colorPalette),
    demoText: demoText,
  };
};


function extractColorsFromSvg(svgUri: string) {
  if (!svgUri || typeof svgUri !== 'string' || !svgUri.includes('base64,')) {
    console.error('Invalid SVG URI provided.');
    return [];
  }

  try {
    const base64Data = svgUri.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid URI");
    }

    // Node.js equivalent of atob()
    const decodedSvg = Buffer.from(base64Data, 'base64').toString('utf8');

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(decodedSvg, 'image/svg+xml');

    const colors = new Set();
    // xmldom's querySelectorAll is a bit limited, so we use getElementsByTagName
    const allElements = svgDoc.getElementsByTagName('*');

    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element) {
        const fill = element.getAttribute('fill');
        const stroke = element.getAttribute('stroke');

        if (fill && fill !== 'none') {
          colors.add(fill);
        }
        if (stroke && stroke !== 'none') {
          colors.add(stroke);
        }
      }
    }

    return Array.from(colors) as string[];

  } catch (error) {
    console.error('Failed to parse SVG or extract colors:', error);
    return [];
  }
};


export const updatePolotnoChildren = (
  polotnoJson: IPolotnoJSON,
  childrenToUpdate: ({ id?: string, properties?: Partial<IPolotnoChild>, page_id?: string, background?: string })[]
): IPolotnoJSON => {
  const newPolotnoJson = JSON.parse(JSON.stringify(polotnoJson)) as IPolotnoJSON;

  for (const update of childrenToUpdate) {
    const pageId = update.page_id;
    const childId = update.id;

   
    let targetPage: IPolotnoPage | undefined;

    // Find the page to search in
    if (pageId) {
      targetPage = newPolotnoJson.pages.find(page => page.id === pageId);
      if (!targetPage) {
        console.warn(`Page with ID ${pageId} not found. Skipping update for child ${childId}.`);
        continue;
      }
    }

    // Iterate through pages or a specific page to find and update the child
    const pagesToSearch = targetPage ? [targetPage] : newPolotnoJson.pages;

    for (const page of pagesToSearch) {
      if (update.background) {
        page.background = update.background;
        continue;
      } else if (childId) {
        const childIndex = page.children.findIndex(child => child.id === childId);
  
        if (childIndex !== -1) {
          const existingChild = page.children[childIndex];
          if (existingChild) {
            const newProperties = { ...update.properties };
            delete newProperties.page_id; // Remove the page_id to avoid adding it to the child object
  
            // Special handling for colorReplace
            if (newProperties.colorReplace) {
              const updatedColorReplace = {
                ...existingChild.colorReplace,
                ...newProperties.colorReplace
              };
              newProperties.colorReplace = updatedColorReplace;
            }
  
            page.children[childIndex] = {
              ...existingChild,
              ...newProperties
            };
          }
  
          // If a page_id was provided, we've found and updated the child, so we can stop searching.
          if (pageId) {
            break;
          }
        }
      }
    }
  }

  return newPolotnoJson;
};