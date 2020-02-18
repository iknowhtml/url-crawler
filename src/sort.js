import fs from 'fs';

const { visitedUrls } = JSON.parse(fs.readFileSync('./visitedUrls.json'));

const sortedUrls = visitedUrls.sort();

fs.writeFileSync(
  'sortedVisitedUrls.json',
  JSON.stringify({ visitedUrls: sortedUrls }),
  'utf8'
);
