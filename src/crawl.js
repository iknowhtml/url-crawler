import fs from 'fs';
import puppeteer from 'puppeteer';

process.on('exit', () => {
  const visitedUrlsArray = [...visitedUrls].sort();
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

const [, , rootUrl = 'https://www.user1st.com/'] = process.argv;

const visitedUrls = new Set([]);
const urlsToVisit = [rootUrl];

const unreachableUrls = [];
const urlRegex = /^https:\/\/(www.)*grandpeaks\.com\/([0-9a-zA-Z-]*\/?)*$/;

const crawl = async () => {
  console.log('crawling...');
  const browser = await puppeteer.launch();
  while (urlsToVisit.length > 0) {
    const url = urlsToVisit.shift();
    if (url === rootUrl || !visitedUrls.has(url)) {
      console.log(url);
      visitedUrls.add(url);
      try {
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
      }
    }
  }
  await browser.close();
  console.log('crawling complete!');
};

crawl();
