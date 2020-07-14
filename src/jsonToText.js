import fs from 'fs';

const [, , client] = process.argv;

const currentDirectory = process.cwd();

const clientDirectory = `${currentDirectory}/data/${client}`;

if (!fs.existsSync(clientDirectory)) {
  throw Error(
    'Please run crawl script first or input the correct client name.'
  );
}

const { urlsToScreenshot: urls } = JSON.parse(
  fs.readFileSync(`${clientDirectory}/urlsToScreenshot.json`)
);

console.log('writing urls to text file...');
let content = '';

urls.forEach(url => {
  content += `${url}\n`;
});

fs.writeFileSync(`${clientDirectory}/urls.txt`, content);
