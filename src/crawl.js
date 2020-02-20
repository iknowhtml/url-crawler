import fs from 'fs';
import puppeteer from 'puppeteer';

const [, , rootUrl] = process.argv;

if (rootUrl === undefined) {
  throw Error('Please pass in a url.');
}

const visitedUrls = new Set();
const urlsToVisit = [
  rootUrl.includes('https://www.') ? rootUrl : `https://www.${rootUrl}`,
];

const [rootDomain] = rootUrl.split('/');

const unreachableUrls = new Set();
const urlRegex = new RegExp(
  `^https://(www\\.)?${rootDomain}(/[0-9a-zA-Z-_]*/?)*$`
);

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
        await page.close();
        hrefs.forEach(href => {
          if (!visitedUrls.has(href) && urlRegex.test(href)) {
            urlsToVisit.push(href);
          }
        });
      } catch (error) {
        console.error(error);
        unreachableUrls.add(url);
      }
    }
  }
  await browser.close();
  console.log('crawling complete!');
};

process.on('exit', () => {
  const currentDirectory = process.cwd();

  const dataDirectory = `${currentDirectory}/data`;

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }

  const [client] = rootDomain.split('.');

  const clientDirectory = `${dataDirectory}/${client}`;

  if (!fs.existsSync(clientDirectory)) {
    fs.mkdirSync(clientDirectory);
  }

  if (visitedUrls.size > 0) {
    const visitedUrlsObject = { visitedUrls: [...visitedUrls].sort() };
    fs.writeFileSync(
      `${clientDirectory}/visitedUrls.json`,
      JSON.stringify(visitedUrlsObject),
      'utf8'
    );
    fs.writeFileSync(
      `${clientDirectory}/urlsToScreenshot.json`,
      JSON.stringify(visitedUrlsObject),
      'utf8'
    );
  }

  if (unreachableUrls.size > 0) {
    const unreachableUrlsObject = {
      unreachableUrls: [...unreachableUrls].sort(),
    };
    fs.writeFileSync(
      `${clientDirectory}/unreachableUrls.json`,
      JSON.stringify(unreachableUrlsObject),
      'utf8'
    );
  }
});

crawl();
