const puppeteer = require("puppeteer");
const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const fs = require("fs");

async function crawlSitemap(sitemapURL) {
  const result = {
    sitemapSize: 0,
    requestsMade: 0,
    nonOKCount: 0,
    nonOKReqURLs: [],
    requests: [],
  };

  try {
    console.time("crawl");

    const sitemapResponse = await axios(sitemapURL);
    const sitemap = sitemapResponse.data;

    const parsedXMLSitemap = await parseStringPromise(sitemap);

    const urls = parsedXMLSitemap.urlset.url.map((url) => {
      result.sitemapSize++;
      return url.loc[0];
    });

    const browser = await puppeteer.launch();

    const crawlingPromises = urls.map(async (url) => {
      const page = await browser.newPage();

      const pageResponse = await page.goto(url, {
        timeout: 0,
        waitUntil: "domcontentloaded",
      });

      const statusCode = pageResponse.status();

      if (statusCode !== 200) {
        result.nonOKCount++;
        result.nonOKReqURLs.push(url);
      }

      result.requests.push({ url: url, status: statusCode });

      await page.close();
    });

    const outputFile = "result.json";

    await Promise.all(crawlingPromises);

    result.requestsMade = result.requests.length;

    fs.writeFileSync(outputFile, JSON.stringify(result));

    await browser.close();

    console.timeEnd("crawl");
  } catch (e) {
    console.error("unable to finish operation ---", e);
  }
}

module.exports = crawlSitemap;
