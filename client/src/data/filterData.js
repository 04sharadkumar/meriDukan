// filterData.js

// Main categories with subcategories and descriptions
export const categories = [
  {
    name: "Men",
    sub: [
      "T-Shirts",
      "Shirts",
      "Jeans",
      "Trousers",
      "Shorts",
      "Jackets",
      "Sweaters",
      "Footwear",
      "Watches",
    ],
    description: "Clothing, footwear, and accessories for men.",
  },
  {
    name: "Women",
    sub: [
      "Tops",
      "Dresses",
      "Jeans",
      "Leggings",
      "Ethnic Wear",
      "Footwear",
      "Handbags",
      "Jewellery",
      "Watches",
    ],
    description: "Trendy clothing, shoes, and accessories for women.",
  },
  {
    name: "Kids",
    sub: [
      "Boys Clothing",
      "Girls Clothing",
      "Toys",
      "Footwear",
      "School Supplies",
    ],
    description: "Clothing, toys, and essentials for children of all ages.",
  },
  {
    name: "Footwear",
    sub: [
      "Sports Shoes",
      "Casual Shoes",
      "Formal Shoes",
      "Sandals",
      "Slippers",
      "Boots",
    ],
    description: "Comfortable and stylish shoes for all genders and ages.",
  },
  {
    name: "Accessories",
    sub: ["Bags", "Belts", "Hats & Caps", "Sunglasses", "Wallets", "Scarves"],
    description: "Fashionable accessories to complement your outfit.",
  },
  {
    name: "Beauty & Personal Care",
    sub: ["Skincare", "Haircare", "Makeup", "Fragrances", "Personal Hygiene"],
    description: "Products for skincare, haircare, makeup, and grooming.",
  },
  {
    name: "Electronics",
    sub: [
      "Mobiles",
      "Headphones",
      "Laptops",
      "Cameras",
      "Smartwatches",
      "Speakers",
    ],
    description: "Latest gadgets, computers, and accessories.",
  },
  {
    name: "Home & Living",
    sub: [
      "Bedsheets",
      "Curtains",
      "Cushions",
      "Kitchen Appliances",
      "Decor",
      "Furniture",
    ],
    description: "Everything to make your home comfortable and stylish.",
  },
  {
    name: "Sports & Fitness",
    sub: ["Gym Equipment", "Sportswear", "Footwear", "Accessories"],
    description: "Equipment, clothing, and gear for all your fitness needs.",
  },
  {
    name: "Toys & Games",
    sub: [
      "Educational",
      "Action Figures",
      "Board Games",
      "Outdoor Toys",
      "Puzzles",
    ],
    description: "Fun and learning combined for kids of all ages.",
  },
  {
    name: "Books & Stationery",
    sub: [
      "Fiction",
      "Non-Fiction",
      "Comics",
      "Textbooks",
      "Art & Craft Supplies",
    ],
    description: "Books and stationery for education and entertainment.",
  },
  {
    name: "Grocery & Gourmet",
    sub: ["Snacks", "Beverages", "Staples", "Organic Products"],
    description: "Everyday essentials, groceries, and specialty foods.",
  },
  {
    name: "Pet Supplies",
    sub: ["Pet Food", "Toys & Accessories", "Healthcare"],
    description: "All you need for your furry friends.",
  },
  {
    name: "Automotive",
    sub: ["Car Accessories", "Motorbike Accessories", "Car Care", "Tools"],
    description: "Enhance and maintain your vehicles.",
  },
];

// Ratings (1 to 5 stars)
export const ratings = [
  { value: 5, description: "Excellent (5 stars)" },
  { value: 4.5, description: "Very Good (4.5 stars & above)" },
  { value: 4, description: "Good (4 stars & above)" },
  { value: 3.5, description: "Average (3.5 stars & above)" },
  { value: 3, description: "Below Average (3 stars & above)" },
  { value: 2, description: "Poor (2 stars & above)" },
  { value: 1, description: "Very Poor (1 star & above)" },
];

// Brands (expanded with electronics, fashion, and lifestyle)
export const brands = [
  "Nike",
  "Adidas",
  "Puma",
  "Reebok",
  "Levi's",
  "Zara",
  "H&M",
  "Tommy Hilfiger",
  "US Polo",
  "Allen Solly",
  "Van Heusen",
  "Under Armour",
  "Woodland",
  "Bata",
  "Skechers",
  "Arrow",
  "Flying Machine",
  "Peter England",
  "Wrangler",
  "Spykar",
  "Mufti",
  "Superdry",
  "Roadster",
  "Mast & Harbour",
  "Louis Philippe",
  "Gap",
  "Celio",
  "Fossil",
  "Casio",
  "Titan",
  "Rolex",
  "Samsung",
  "Apple",
  "OnePlus",
  "Canon",
  "Sony",
  "LG",
  "Philips",
  "Philips",
  "Whirlpool",
  "HP",
  "Dell",
  "Lenovo",
];

// Prices
export const prices = [
  { range: "Under ₹499", description: "Budget friendly products under ₹499" },
  {
    range: "₹500 - ₹999",
    description: "Affordable products between ₹500 and ₹999",
  },
  {
    range: "₹1000 - ₹1999",
    description: "Mid-range products between ₹1000 and ₹1999",
  },
  {
    range: "₹2000 - ₹2999",
    description: "Premium products between ₹2000 and ₹2999",
  },
  {
    range: "₹3000 - ₹4999",
    description: "High-quality products between ₹3000 and ₹4999",
  },
  {
    range: "₹5000 - ₹9999",
    description: "Luxury products between ₹5000 and ₹9999",
  },
  {
    range: "₹10000 - ₹19999",
    description: "Exclusive products between ₹10000 and ₹19999",
  },
  {
    range: "₹20000 & Above",
    description: "Top-tier premium products above ₹20000",
  },
];

// Discounts
export const discounts = [
  "10% or more",
  "20% or more",
  "30% or more",
  "40% or more",
  "50% or more",
  "60% or more",
  "70% or more",
];

// Sizes
export const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "Free Size",
  "Kids: 0-1 yrs",
  "Kids: 1-2 yrs",
  "Kids: 2-3 yrs",
  "Kids: 3-4 yrs",
];

// Gender / Audience
export const genders = ["Men", "Women", "Boys", "Girls", "Unisex"];

// Sleeve types
export const sleeves = [
  "Full Sleeve",
  "Half Sleeve",
  "Sleeveless",
  "3/4th Sleeve",
  "Short Sleeve",
  "Cap Sleeve",
  "Bell Sleeve",
];

// Collar types
export const collars = [
  "Spread Collar",
  "Mandarin Collar",
  "Polo",
  "Round Neck",
  "V-Neck",
  "Hooded",
  "Button-Down Collar",
  "Notch Collar",
];

// Fabrics / Materials
export const fabrics = [
  "Cotton",
  "Linen",
  "Polyester",
  "Denim",
  "Silk",
  "Rayon",
  "Wool",
  "Nylon",
  "Blended",
  "Georgette",
  "Chiffon",
  "Leather",
  "Suede",
];

// Patterns
export const patterns = [
  "Solid",
  "Striped",
  "Checked",
  "Printed",
  "Floral",
  "Polka Dots",
  "Colorblock",
  "Abstract",
  "Geometric",
  "Embroidered",
  "Tie & Dye",
];

// Occasions
export const occasions = [
  "Casual",
  "Formal",
  "Party",
  "Sports",
  "Ethnic",
  "Wedding",
  "Travel",
  "Lounge",
  "Office Wear",
  "Festive",
  "Night Out",
];

// Colors
export const colors = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
  "Brown",
  "Grey",
  "Beige",
  "Multicolor",
];

// Availability options
export const availabilityOptions = [
  "In Stock",
  "Out of Stock",
  "Pre-Order",
  "Coming Soon",
];

// Sorting options
export const sortOptions = [
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
  "Best Sellers",
  "Customer Ratings",
  "Discount",
];

// Combined filterData for UI
export const filterData = {
  categories,
  brands,
  sizes,
  genders,
  prices,
  discounts,
  sleeves,
  collars,
  fabrics,
  patterns,
  occasions,
  colors,
  availabilityOptions,
  ratings,
  sortOptions,
};
