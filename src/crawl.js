import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

axios.interceptors.response.use(({ data }) => data);

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
  `^http(s)?://(www\\.)?${rootDomain}(/[0-9a-zA-Z-_?=]*/?)*$`
);

const crawl = async () => {
  console.log('crawling...');
  while (urlsToVisit.length > 0) {
    const url = urlsToVisit.shift();
    if (url === rootUrl || !visitedUrls.has(url)) {
      console.log(url);
      visitedUrls.add(url);
      try {
        const html = await axios.get(url);
        const $ = cheerio.load(html);
        const hrefs = Array.from($('a[href]')).map(link => link.attribs.href);
        hrefs.forEach(href => {
          if (!visitedUrls.has(href) && urlRegex.test(href)) {
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
