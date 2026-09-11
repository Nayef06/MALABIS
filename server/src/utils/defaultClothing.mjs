import { ClothingItem } from "../models/clothingItem.mjs";

export const defaultClothingItems = {
  "Hats": [
    {
      "name": "YANKEES CAP",
      "color": "black",
      "image": "https://images.footlocker.com/is/image/EBFL2/60538219_01?wid=500&hei=500&fmt=png-alpha"
    },
    {
      "name": "BUCKET HAT",
      "color": "white",
      "image": "https://static.vecteezy.com/system/resources/previews/025/361/388/original/white-bucket-hat-transparent-png.png"
    },
    {
      "name": "BEANIE",
      "color": "yellow",
      "image": "https://static.vecteezy.com/system/resources/previews/021/916/535/non_2x/yellow-beanie-hat-isolated-on-a-transparent-background-png.png"
    }
  ],
  "Jackets": [
    {
      "name": "PUFFER",
      "color": "black",
      "image": "https://www.pngall.com/wp-content/uploads/15/Black-Puffer-Jacket-PNG-Photo.png"
    },
    {
      "name": "THRASHER",
      "color": "black",
      "image": "https://www.pngarts.com/files/9/Black-Hoodie-Front-PNG-HD-Photo.png"
    },
    {
      "name": "VARSITY",
      "color": "blue",
      "image": "https://wallpapers.com/images/hd/varsity-jacket-png-05252024-mfvccy99r4ljmj6y.jpg"
    }
  ],
  "Shirts": [
    {
      "name": "BASIC T",
      "color": "black",
      "image": "https://www.pngmart.com/files/22/T-Shirt-PNG-Photo.png"
    },
    {
      "name": "FEAR OF GOD",
      "color": "brown",
      "image": "https://image.goat.com/750/attachments/product_template_pictures/images/054/271/225/original/768850_00.png.png"
    },
    {
      "name": "M SALAH",
      "color": "red",
      "image": "https://cyberriedstore.com/wp-content/uploads/2023/05/Liverpool-Home-Mo-Salah-Football-number-11-jersey-back.png"
    }
  ],
  "Pants": [
    {
      "name": "JEANS",
      "color": "blue",
      "image": "https://purepng.com/public/uploads/large/purepng.com-mens-jeansgarmentlower-bodydenimjeansnavy-blue-1421526362794kpmhb.png"
    },
    {
      "name": "BAGGY B",
      "color": "black",
      "image": "https://parkeofficial.com/cdn/shop/files/background_removal_TUFIR3YzMXJCNFUjMSM2Y2FmMjhhNTNhMzRiYzBiNTFlMTQ3ZGQxNmEyZTRmMCMxNTAwIyNUUkFOU0ZPUk1BVElPTl9SRVFVRVNU.png?v=1776094022"
    },
    {
      "name": "NIKE TECH",
      "color": "black",
      "image": "https://thesolestory.com/cdn/shop/files/60980-63_004_831166a9-abe1-405c-88bb-2ccd15ef1e0b_800x.png?v=1693994156"
    }
  ],
  "Shoes": [
    {
      "name": "J1 RETRO",
      "color": "red",
      "image": "https://static.nike.com/a/images/w_1280,q_auto,f_auto/kj11ctakaqzca1hrkbkh/air-jordan-1-retro-chicago-release-date.jpg"
    },
    {
      "name": "AF1",
      "color": "white",
      "image": "https://www.pngarts.com/files/8/Nike-Air-Force-One-PNG-Transparent-Image.png"
    },
    {
      "name": "GREY FOG",
      "color": "gray",
      "image": "https://sneakernerds.com/cdn/shop/products/nike-dunk-low-lottery-1-1000.png?v=1664187444"
    }
  ],
  "Accessories": [
    {
      "name": "SUNGLASSES",
      "color": "black",
      "image": "https://pngimg.com/d/sunglasses_PNG60.png"
    },
    {
      "name": "WATCH",
      "color": "blue",
      "image": "https://worldofluxuryus.com/cdn/shop/products/18-2_aa7920b6-4440-458e-ac55-22b6cbebb1fb.png?v=1687624072"
    },
    {
      "name": "RING",
      "color": "gray",
      "image": "https://zeghani.com/cdn/shop/files/ZM123_WHITE_14K_X_WHITE_4184c094-b158-4def-bff2-8b4d2bf1b7db.png?v=1726162741"
    }
  ]
};

const categoryToTypeMap = {
  "Hats": "hat",
  "Jackets": "jacket", 
  "Shirts": "shirt",
  "Pants": "pants",
  "Shoes": "shoes",
  "Accessories": "accessory"
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
