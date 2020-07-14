import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

// configures axios to automatically destructure response
axios.interceptors.response.use(({ data }) => data);

const [, , rootDomain] = process.argv;

if (rootDomain === undefined) {
  throw Error('Please pass in a url.');
}

const urlPrefix = 'https?:\\/\\/(www\\.)?';
const urlPath = '(\\/[0-9a-zA-Z-_?=]*)*';
const absoluteUrlRegex = new RegExp(`^${urlPrefix}${rootDomain}${urlPath}$`);
const relativeUrlRegex = new RegExp(`^${urlPath}$`);

const visitedUrls = new Set();
const urlsToVisit = [`https://${rootDomain}`];
const unreachableUrls = new Set();

const crawl = async () => {
  console.log('crawling...');
  while (urlsToVisit.length > 0) {
    const url = urlsToVisit.shift();

    if (!visitedUrls.has(url)) {
      console.log(url);
      visitedUrls.add(url);
      try {
        const html = await axios.get(url);
        const $ = cheerio.load(html);
        const hrefs = Array.from($('a[href]')).map(link => link.attribs.href);
        hrefs.forEach(href => {
          //checks if href is a relative url
          href = relativeUrlRegex.test(href)
            ? `https://${rootDomain}${href}`
            : href;

          if (!visitedUrls.has(href) && absoluteUrlRegex.test(href)) {
            urlsToVisit.push(href);
          }
        });
      } catch (error) {
        console.log(`unable to reach ${url}`);
        unreachableUrls.add(url);
      }
    }
  }
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
    const sortedUrls = [...visitedUrls].sort();
    const visitedUrlsObject = { visitedUrls: sortedUrls };
    const urlsToScreenshotObject = { urlsToScreenshot: sortedUrls };

    fs.writeFileSync(
      `${clientDirectory}/visitedUrls.json`,
      JSON.stringify(visitedUrlsObject),
      'utf8'
    );
    fs.writeFileSync(
      `${clientDirectory}/urlsToScreenshot.json`,
      JSON.stringify(urlsToScreenshotObject),
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
