import mongoose from 'mongoose';


const keyValueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (v) {
        return Number(v) < Number(this.price);// discount must be less than price
        },
        message: "Discount price must be less than original price",
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      default: 'Generic',
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String },
        },
      ],
       validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1 && v.length <= 3; // must upload exactly 3 images
        },
        message: "Exactly 3 images are required",
      },
    },
    sizes: {
      type: [String], // e.g. ["S", "M", "L", "XL"]
      default: [],
    },
    specifications: {
      type: [keyValueSchema], // [{ key: "Processor", value: "i7" }]
      default: [],
      validate: {
        validator: function (specs) {
          const keys = specs.map((s) => s.key.toLowerCase());
          return new Set(keys).size === keys.length; // ensure unique keys
        },
        message: "Duplicate specification keys are not allowed",
      },
    },
     additionalInfo: {
      type: [keyValueSchema], // [{ key: "Warranty", value: "2 years" }]
      default: [],
      validate: {
        validator: function (info) {
          const keys = info.map((i) => i.key.toLowerCase());
          return new Set(keys).size === keys.length;
        },
        message: "Duplicate additionalInfo keys are not allowed",
      },
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review',
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);