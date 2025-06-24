# parse_yamaya.py
import sys
import asyncio
import json
from datetime import datetime
from playwright.async_api import async_playwright

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4)...",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7)...",
]

async def extract_label(page, label):
    handle = await page.evaluate_handle(f"""
        () => {{
            const el = document.evaluate(
                '//b[contains(text(), "{label}")]',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            return el && el.nextSibling ? el.nextSibling.textContent.trim() : "";
        }}
    """)
    return await handle.json_value()

async def get_kin_data(date_str):
    date = datetime.strptime(date_str, "%Y-%m-%d")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENTS[0])
        page = await context.new_page()
        url = f"https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday={date.day}&formmonth={date.month}&formyear={date.year}"
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_function("""
            () => {
                const el = document.evaluate('//b[contains(text(), "Кин:")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                return el && el.nextSibling && el.nextSibling.textContent.trim() !== "";
            }
        """, timeout=10000)
        data = {
            "kin": await extract_label(page, "Кин:"),
            "tone": await extract_label(page, "Тон"),
            "seal": await extract_label(page, "Печать"),
        }
        await browser.close()
        return data

if __name__ == "__main__":
    # Ожидает дату в аргументе командной строки
    input_date = sys.argv[1] if len(sys.argv) > 1 else None
    if not input_date:
        print(json.dumps({"error": "Date parameter required, format YYYY-MM-DD"}))
    else:
        result = asyncio.run(get_kin_data(input_date))
        print(json.dumps(result, ensure_ascii=False))
