import fs from 'fs';
import { createInstance, PolotnoInstance } from 'polotno-node';
import puppeteer from 'puppeteer';


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
    return filename;

  } catch (error) {
    console.error('Error converting polotnoJSON to image:', error);
    throw error;
  }
  // No need to close instance here - it's reused
}