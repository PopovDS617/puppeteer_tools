const crawlSitemap = require("./app.js");

const sitemapURL = "https://popov-d.site/sitemap-0.xml";

function main() {
  crawlSitemap(sitemapURL);
}

main();
