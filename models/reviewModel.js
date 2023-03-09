const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: ["true", "Review cannot be empty"],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    //Parent refrencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: ["true", "The review must have an Tour "],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: ["true", "The review must have an user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
