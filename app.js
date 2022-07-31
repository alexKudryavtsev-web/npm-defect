import puppeteer from "puppeteer";

async function start() {
  const PACKAGE_NAME = "nodemon";
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.npmjs.com/package/${PACKAGE_NAME}`, {
    waitUntil: "networkidle2",
  });

  const res = await page.evaluate(() => {
    const amountDownloads = +document
      .querySelector(
        "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(5) > div > div > p"
      )
      .innerHTML.replace(/,/g, "");

    const size = document.querySelector(
      "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(8) > p"
    )?.innerHTML ?? null;

    const dateLastPublication =
      document
        .querySelector(
          "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(12) > p > time"
        )
        .attributes.getNamedItem("datetime").nodeValue;

    return { amountDownloads, size, dateLastPublication };
  });

  console.log(res);

  await page.close();
}

start();
