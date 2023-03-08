const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must Have a Name"],
      unique: true,
      trim: true,
      maxlength: [40, "The Tour have maximum of 40 Character"],
      minlength: [10, "The Tour have minimum of 10 Character"],
      //  validate : [validator.isAlpha , 'Tour Name Must Only Contain Character']
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a Group Size"],
    },

    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      // enum : {
      //    values : ['easy' , 'medium' ,'difficulty'],
      //    message : 'The difficulty can only be easy , medium and hard'
      // }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "A Tour Must Have a Price"],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: "The Discount cannot be higher than Actual Price {{VALUE}}",
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,

      required: [true, "A tour must have a Image Cover"],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: [
      {
        type: {
          type: String,
          default: "Point",
          // enum : ['point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],

    locations: [
      {
        type: {
          type: String,
          default: "Point",

          // enum:['point'],
        },
        description: String,
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Creating the Virtual Properies
//   Virtual properties are properties in Mongoose that can be derived from other properties but do not get persisted in the database.

tourSchema.virtual("durationWeek").get(function() {
  return this.duration / 7;
});

// 1)DOCUMENT MIDDLEWARE
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// 2)QUERY MIDDLEWARE
//   tourSchema.pre('find' , function(next)
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//   Here in our query middleware we use find and use this function to find in the document where the secretTour is not equal to true . This can be the great useCase in real life problem where we have to hide some things from public and only available to secret Memeber

// 3) AGGREGATION MIDDLEWARE

tourSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

//Populating MiddleWare
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
  });
  next();
});

//NOw we have to create the Model for following schemea
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
