import sys
import json
from playwright.sync_api import sync_playwright

year = sys.argv[1]
month = sys.argv[2]
day = sys.argv[3]

url = f"https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday={day}&formmonth={month}&formyear={year}"

result = {
    "kin": None,
    "tone": None,
    "seal": None
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(url, wait_until="networkidle")
    text = page.content()

    import re
    kin = re.search(r"Кин:\s*(\d+)", text)
    tone = re.search(r"Тон.*?:\s*([^<]+)<", text)
    seal = re.search(r"Печать.*?:\s*([^<]+)<", text)

    if kin:
        result["kin"] = int(kin.group(1))
    if tone:
        result["tone"] = tone.group(1).strip()
    if seal:
        result["seal"] = seal.group(1).strip()

    browser.close()

print(json.dumps(result))
