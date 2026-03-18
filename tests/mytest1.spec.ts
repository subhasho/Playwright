import  { test,expect } from "@playwright/test";

test("verify page url",async({page})=>{

    await page.goto("https://www.google.com/");
    let url:String=await page.title();
    console.log("URL :",url);
    await expect(page).toHaveURL(/google/);




}
)