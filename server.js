"use strict";

const { join } = require("path");
const puppeteer = require("puppeteer");

/**
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://localhost:1337/");
    await page.emulateMedia("screen");
    await page.pdf({
        path: "./rapport.pdf",
        printBackground: true,
        width: "612px",
        // a4 format is 100 dpi -> 586 x 842 or 827 x 1170
        // match the css width and height we set for our PDF
        height: "792px"
    });
    await browser.close();
    console.log("rapport.pdf successfully created!");
    process.exit(0);
}

main().catch(console.error);
