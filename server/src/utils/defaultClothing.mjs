import { ClothingItem } from "../models/clothingItem.mjs";

// Client and API deploy independently; backend tests keep their catalogs in sync.
const clothingByCategory = {
  "Shirts": [
    {
      "name": "Black Oversized",
      "color": "black"
    },
    {
      "name": "Plain White",
      "color": "white"
    },
    {
      "name": "Knit Polo",
      "color": "brown"
    }
  ],
  "Jackets": [
    {
      "name": "Light Gray Hoodie",
      "color": "gray"
    },
    {
      "name": "Puffer Jacket",
      "color": "black"
    },
    {
      "name": "Quarter Zip",
      "color": "blue"
    }
  ],
  "Pants": [
    {
      "name": "Jeans",
      "color": "blue"
    },
    {
      "name": "Dark Baggy Jeans",
      "color": "black"
    },
    {
      "name": "Light Baggy Jeans",
      "color": "blue"
    }
  ],
  "Shoes": [
    {
      "name": "Sambas",
      "color": "black"
    },
    {
      "name": "New Balance",
      "color": "gray"
    },
    {
      "name": "Blazers",
      "color": "white"
    }
  ],
  "Accessories": [
    {
      "name": "Sunglasses",
      "color": "black"
    },
    {
      "name": "Casio Watch",
      "color": "gray"
    }
  ]
};

export const defaultClothingItems = Object.fromEntries(
  Object.entries(clothingByCategory).map(([category, items]) => [category,
    items.map((item) => ({
      ...item,
      // Resolve on the client origin, including when the API has its own host.
      image: `/images/default-clothing/${category}/${encodeURIComponent(item.name)}.png`,
    })),
  ]),
);

const categoryToTypeMap = {
  Jackets: "jacket",
  Shirts: "shirt",
  Pants: "pants",
  Shoes: "shoes",
  Accessories: "accessory",
};

export async function createDefaultClothingItems() {
  const items = Object.entries(defaultClothingItems).flatMap(
    ([category, categoryItems]) => categoryItems.map((item) => ({
      type: categoryToTypeMap[category],
      color: item.color,
      name: item.name,
      imageLink: item.image,
      isFavorited: false,
    })),
  );
  const createdItems = await ClothingItem.insertMany(items);
  return createdItems.map((item) => item._id);
}
