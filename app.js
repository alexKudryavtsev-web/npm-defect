import { launch } from "puppeteer";

const packageName = process.argv[2] || "math_progression";

async function estimate(packageName) {
  console.log("\x1b[36m", "Packet information collection begins:");

  const info = await parseInfoAboutPackage(packageName);

  console.log("\x1b[36m", "Collected. Data analysis:");

  const reason = [];

  if (!info.githubLink) {
    reason.push("no github link");
  }

  if (info.amountDownloads < 50000) {
    reason.push("too few downloads");
  }

  if (info.amountDependents <= 10) {
    reason.push("rarely or not used at all in other packages");
  }

  if (info.amountDependencies > 15) {
    reason.push("too many dependencies on third party packages");
  }

  if (checkDateLastPublication(info.dateLastPublication)) {
    reason.push("last updated over a year ago");
  }

  if (reason < 2) {
    console.log("\x1b[32m", "OK");
  } else {
    console.log("\x1b[31m", `Defect package: ${reason.join(", ")}`);
  }
}

estimate(packageName);

async function parseInfoAboutPackage(name) {
  const URL = `https://www.npmjs.com/package/${name}`;

  const browser = await launch({ headless: true });

  const page = await browser.newPage();

  page.setViewport({ height: 750, width: 1500 });

  await page.goto(URL, {
    waitUntil: "networkidle2",
  });

  const amountDownloads = await page.evaluate(parseAmountDownloads);
  const amountDependencies = await page.evaluate(parseAmountDependencies);
  const amountDependents = await page.evaluate(parseAmountDependents);
  const dateLastPublication = new Date(
    await page.evaluate(parseDateLastPublication)
  );
  const githubLink = await page.evaluate(parseGithubLink);

  const res = {
    amountDownloads,
    amountDependencies,
    amountDependents,
    dateLastPublication,
    githubLink,
  };

  await browser.close();

  return res;
}

function parseAmountDownloads() {
  try {
    const element = document.querySelector(
      "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(5) > div > div > p"
    );

    return Number.parseInt(element.innerHTML.replace(/,/g, ""));
  } catch (error) {
    return null;
  }
}

function parseAmountDependencies() {
  try {
    const element = document.querySelector("#package-tab-dependencies > span");

    console.log(element);
    return Number.parseInt(
      element.innerHTML.match(/<svg.*\/svg>(\d*)/)[1].replace(/,/g, "")
    );
  } catch (error) {
    return null;
  }
}

function parseAmountDependents() {
  try {
    const element = document.querySelector("#package-tab-dependents > span");

    return Number.parseInt(
      element.innerHTML.match(/<svg.*\/svg>(\d*)/)[1].replace(/,/g, "")
    );
  } catch (error) {
    return null;
  }
}

function parseDateLastPublication() {
  try {
    const element = document.querySelector(
      "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(12) > p > time"
    );

    return element.attributes.getNamedItem("datetime").nodeValue;
  } catch (error) {
    return null;
  }
}

function parseGithubLink() {
  try {
    const element = document.querySelector(
      "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div:nth-child(3) > p > a"
    );

    return element.attributes.getNamedItem("href").nodeValue;
  } catch (error) {
    return null;
  }
}

function checkDateLastPublication(date) {
  const currentDate = new Date();
  const yearAgo = new Date(currentDate.setMonth(currentDate.getFullYear() - 1));

  return date > yearAgo;
}

checkDateLastPublication();
