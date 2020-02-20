import fs from 'fs';
import puppeteer from 'puppeteer';

const [, , client] = process.argv;

const currentDirectory = process.cwd();

const clientDirectory = `${currentDirectory}/data/${client}`;

if (!fs.existsSync(clientDirectory)) {
  throw Error(
    'Please run crawl script first or input the correct client name.'
  );
}

const screenshotsDirectory = `${clientDirectory}/screenshots`;

if (!fs.existsSync(screenshotsDirectory)) {
  fs.mkdirSync(screenshotsDirectory);
}

const { urlsToScreenshot } = JSON.parse(
  fs.readFileSync(`${clientDirectory}/urlsToScreenshot.json`)
);

const screenshot = async () => {
  const browser = await puppeteer.launch();
  console.log('taking screenshots...');
  while (urlsToScreenshot.length > 0) {
    const url = urlsToScreenshot.shift();
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url);
      console.log(`taking screenshot of ${url}...`);
      const path = `${screenshotsDirectory}/${url
        .replace('https://', '')
        .replace(/\//g, '%')}.png`;
      console.log(path);
      await page.screenshot({
        path,
        fullPage: true,
      });
      console.log(`screenshot of ${url} complete.`);
    } catch (e) {
      console.log(e);
    }
  }
  browser.close();
  console.log('screenshots complete.');
};

screenshot();
