import fs from 'fs';
import puppeteer from 'puppeteer';

process.on('exit', (options, exitCode) => {
  const visitedUrlsArray = [...visitedUrls];
  const visitedUrlsObject = { visitedUrls: visitedUrlsArray };
  fs.writeFileSync(
    'visitedUrls.json',
    JSON.stringify(visitedUrlsObject),
    'utf8'
  );

  if (unreachableUrls.length > 0) {
    const unreachableUrlsObject = { unreachableUrls };
    fs.writeFileSync(
      'unreachableUrls.json',
      JSON.stringify(unreachableUrlsObject),
      'utf8'
    );
  }
});

const [, , rootUrl = 'https://www.user1st.com/', depth = 1] = process.argv;

const visitedUrls = new Set([]);
const urlsToVisit = [rootUrl];

const unreachableUrls = [];
const urlRegex = /https\:\/\/(www.)*user1st\.com(\/[0-9a-zA-Z\-]*\/?)*$/;

const crawl = async () => {
  console.log('crawling...');
  while (urlsToVisit.length > 0) {
    const url = urlsToVisit.shift();
    if (url === rootUrl || !visitedUrls.has(url)) {
      console.log(url);
      visitedUrls.add(url);
      let browser;
      try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const hrefs = await page.evaluate(() => {
          const links = [...document.querySelectorAll('a[href]')];
          return links.map(({ href }) => href);
        });
        hrefs.forEach(href => {
          if (!visitedUrls.has(href) && urlRegex.test(href)) {
            urlsToVisit.push(href);
          }
        });
      } catch (error) {
        console.error(error);
        unreachableUrls.push(url);
      } finally {
        await browser.close();
      }
    }
  }
  console.log('crawling complete!');
};

crawl();
