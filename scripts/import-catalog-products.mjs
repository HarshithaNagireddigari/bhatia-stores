import dotenv from "dotenv";
import pg from "pg";
import { randomUUID } from "node:crypto";

dotenv.config({ path: ".env.local" });

const { Client } = pg;

const catalogues = [
  {
    slug: "step-riser",
    pages: 8,
    name: "Matt Step & Riser Tile",
    description: "Matt-finish stair step and riser tile from the G-NAM catalogue. Refer to the product image for the design code and dimensions.",
    price: 450,
  },
  {
    slug: "suncore-dc",
    pages: 13,
    name: "SunCore Matrix Light 600x600 Double Charge Tile",
    description: "600x600 mm double-charge vitrified tile from the SunCore Matrix Light series. Refer to the product image for the selected design.",
    price: 1650,
  },
  {
    slug: "suncore-matt",
    pages: 12,
    name: "NCT Satin Matt 600x600 Porcelain Tile",
    description: "600x600 mm satin-matt porcelain tile. The catalogue image shows the available design and finish.",
    price: 1500,
  },
  {
    slug: "nct",
    pages: 31,
    startPage: 2,
    name: "NCT Ceramic Tile",
    description: "Ceramic tile from the NCT catalogue. Refer to the product image for the exact design and finish.",
    price: 800,
  },
  {
    slug: "gnam-wall",
    pages: 34,
    startPage: 2,
    name: "G-NAM Premium 300x450 Digital Wall Tile",
    description: "Premium waterproof 300x450 mm digital wall tile from G-NAM Ceramica. The catalogue image shows the exact design.",
    price: 700,
  },
  {
    slug: "bhatia-catalogue",
    pages: 14,
    startPage: 2,
    name: "Bhatia Tiles Catalogue Design",
    description: "Tile design from Bhatia Sanitaryware and Hardware. Refer to the catalogue image for the exact pattern and specifications.",
    price: 800,
  },
  {
    slug: "hindware",
    pages: 18,
    name: "Hindware Italian Collection Tile",
    description: "Premium tile from the Hindware Italian Collection. Refer to the catalogue image for the exact design, colour, and size.",
    price: 4800,
  },
];

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let imported = 0;
for (const catalogue of catalogues) {
  for (let page = catalogue.startPage ?? 1; page <= catalogue.pages; page += 1) {
    const pageNumber = String(page).padStart(2, "0");
    const name = `${catalogue.name} - Design ${pageNumber}`;
    const image = `/products/catalog/${catalogue.slug}-${pageNumber}.jpg`;
    const existing = await client.query("SELECT id FROM products WHERE name = $1 LIMIT 1", [name]);

    if (existing.rowCount) continue;

    await client.query(
      `INSERT INTO products (id, name, description, price, image, category, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        randomUUID(),
        name,
        catalogue.description,
        catalogue.price.toFixed(2),
        image,
        "Tiles & Sanitaryware",
        10,
      ],
    );
    imported += 1;
  }
}

await client.end();
console.log(`Imported ${imported} catalogue products.`);
