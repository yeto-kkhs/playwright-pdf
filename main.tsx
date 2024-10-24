import { renderToStaticMarkup } from "react-dom/server";
import { chromium as playwright } from "playwright";
import path from "node:path";
import fs from "node:fs/promises";
import { ReactNode } from "react";

const data = [
  {
    id: 1,
    name: "山田 太郎",
    age: 30,
    address: "東京都新宿区",
    items: [
      { itemName: "商品A", quantity: 2, price: 1000 },
      { itemName: "商品B", quantity: 1, price: 2000 },
    ],
  },
  {
    id: 2,
    name: "佐藤 花子",
    age: 25,
    address: "東京都渋谷区",
    items: [
      { itemName: "商品C", quantity: 3, price: 1500 },
      { itemName: "商品D", quantity: 2, price: 3000 },
    ],
  },
  {
    id: 3,
    name: "鈴木 一郎",
    age: 40,
    address: "東京都港区",
    items: [
      { itemName: "商品E", quantity: 1, price: 5000 },
      { itemName: "商品F", quantity: 4, price: 2500 },
    ],
  },
];

function Pdf() {
  return (
    <body style={{ fontFamily: "NotoSansJP" }}>
      <h1 style={{ color: "red" }}>
        Title タイトル
      </h1>
      <p>description 説明です</p>
      <ul style={{ listStyle: "none" }}>
        {data.map((d) => (
          <li key={d.id}>
            <div
              style={{ display: "flex", "gap": "8px", alignItems: "center" }}
            >
              <h2>{d.name}</h2>
              <p>{d.age}歳</p>
              <p>{d.address}</p>
            </div>
            <ul style={{ listStyle: "none" }}>
              {d.items.map((item) => (
                <li
                  key={item.itemName}
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <p>{item.itemName}</p>
                  <p>{item.quantity}個</p>
                  <p>{item.price}円</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </body>
  );
}

function Html({ font, children }: { font: string; children: ReactNode }) {
  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'NotoSansJP';
              src: url(data:application/x-font-ttf;charset=utf-8;base64,${font}) format('truetype');
            }
          `,
          }}
        />
        <script>
          {`
            document.addEventListener('DOMContentLoaded', async () => {
              await document.fonts.ready;
            });
          `}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}

async function fontBase64(fontFileName: string) {
  const font = await fs.readFile(
    path.resolve(__dirname, "assets", "fonts", fontFileName),
    { encoding: "base64" },
  );
  return font;
}

async function main() {
  await using browser = await playwright.launch({
    headless: true,
  });
  const page = await browser.newPage();

  const font = await fontBase64("NotoSansJP.ttf");

  await page.setContent(renderToStaticMarkup(
    <Html font={font}>
      <Pdf />
    </Html>,
  ));
  await page.pdf({ path: "output.pdf", format: "A4" });
}

main();
