const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");

const scriptFilePath = path.join(__dirname, "workreports.js");

(async function example() {
    const options = new chrome.Options();
    options.addArguments("--auto-open-devtools-for-tabs");
    options.addArguments("--start-maximized");
    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
    try {
        await driver.get("https://hrbc-jp.porterscloud.com/index/login");
        await driver.wait(
            until.elementLocated(By.id("Model_LoginForm_company_login_id")),
            3000
        );
        const companyInput = driver
            .findElement(By.id("Model_LoginForm_company_login_id"))
            .sendKeys("portersworkreport");
        const usernameInput = driver
            .findElement(By.id("Model_LoginForm_username"))
            .sendKeys(process.env.username);
        const passwordInput = driver
            .findElement(By.id("Model_LoginForm_password"))
            .sendKeys(process.env.hrbcpassword);
        await Promise.all([companyInput, usernameInput, passwordInput]);
        await driver
            .findElement(By.id("Model_LoginForm_password"))
            .sendKeys(Key.ENTER);
        await driver.navigate().to("https://hrbc-jp.porterscloud.com/calendar");
        await driver.wait(until.elementLocated(By.id("pageCalendar")), 3000);
        driver.findElement(By.className("fc-button-month")).click();
        const scriptContent = await fsPromises.readFile(scriptFilePath, {
            encoding: "utf-8"
        });
        await driver.executeScript(scriptContent);
    } finally {
        // await driver.quit();
    }
})();
