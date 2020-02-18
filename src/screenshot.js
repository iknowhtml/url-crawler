import fs from 'fs';
import puppeteer from 'puppeteer';

const { urlsToScreenshot } = JSON.parse(
  fs.readFileSync('./data/urlsToScreenshot.json')
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
      const path = `./data/screenshots/${url.replace(/\//g, '-')}.png`;
      await page.screenshot({
        path,
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
