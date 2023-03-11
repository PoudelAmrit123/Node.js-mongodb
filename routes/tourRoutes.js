const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");
// const reviewController = require("../controllers/reviewController");


const router = express.Router();

// router.param('id', tourController.checkID);

//Merge Route
router.use('/:tourId/reviews' , reviewRouter);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

//POST /tour/2e45f/reviews
//GET /tour/23ef5/reviews
//GET /tour/23ef5/reviews/245fr

//Nested Loop so that we can use the review directly from the login user rather than passing the both tour id and user id while writing the review

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );

//  Instead of using this we can use the advanced express feature called merge parameter 

module.exports = router;
