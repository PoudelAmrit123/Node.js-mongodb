
const { create } = require('./../models/tourModel');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures')

exports.aliasTopTours  = (req , res , next)=>{
  req.query.limit = '5' ;
  req.query.sort = '-ratingsAverage,price' ;
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty' ;

  next();
  
}

//Here we are using alias Top Tours as an middleWAre where we specifies our route in  the tourroutes file and in get request we first pass the middleware where all are preequiest such as limit sort fields are defined before passing it down to the getAllTours method where we donot have to specifies differently 



// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );


//    //CHECKID
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };
    

// //CHECKING THE BODY
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };



exports.getAllTours =  async (req, res) => {
  try{
         

  const features = new APIFeatures(Tour.find() , req.query).filter().sort().limitFields().paginate();

          const tours =   await features.query ;
  
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    });
  }
  
  
  catch (err){
   res.status(404).json({
    status :'fail',
    message : err , 
   })

  }
};

exports.getTour =async (req, res) => {
   try{
  const tour = await Tour.findById(req.params.id);
              // .populate({
              //   path : 'guides',
              //    });
           res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });


   }catch(err){
    res.status(404).json({
      status :'fail',
      message : err , 
     })
   }

  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour =  async (req, res) => {

     try{
       //  const newTour = new Tour({})
       //  newTour.save()
         // We have another way to create the data 
       const newTour = await Tour.create(req.body);
         //Create Return the promises


 res.status(201).json({
   status: 'success',
   data: {
     tour: newTour
   }
 });
}  catch (err){
   res.status(404).json({
       status : 'fail',
       message : err,

   })


}




  



  // console.log(req.body);

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );
};

exports.updateTour = async (req, res) => {
  
  try{
     

    const tour  = await Tour.findByIdAndUpdate(req.params.id , req.body , {
      new: true , 
      runValidators : true ,

    })
       res.status(200).json({
         status: 'success',
         data: {
           tour: tour , 
         }
       });

   } catch(err){
    res.status(404).json({
      status : 'fail',
      message : 'Invalid Data Sent' ,

  })
   }



};

exports.deleteTour =  async (req, res) => {

    try{
      // We donot have to save it to any variable when have to delete the something and its the common practise
     await Tour.findByIdAndDelete(req.params.id  )

      res.status(204).json({
        status: 'success',
        data: null
      });


    } catch(err){

      res.status(404).json({
        status : 'fail',
        message : 'Invalid Id Sent' ,
  
    })
    }
};

            //AggreGation Pipeling

  exports.getTourStats = async (req, res)=>{

    try{
           const stats=  await Tour.aggregate([
            {
             $match : { ratingsAverage : {$gte : 4.5}}
           },
           {
            $group : { 
              _id: { $toUpper: '$difficulty' },
              // this numTours sum =1 is bsiscally that at every Tours this pipline will be added by 1 and we will get our total num of tours 
              
              numTours : {$sum : 1}, 
              numRatings : { $sum : '$ratingsQuantity'}, 
              avgRating : { $avg : '$ratingsAverage'}, 
              avgPrice : { $avg : '$price'},
               maxPrice : { $max : '$price'},
               minPrice : { $min : '$price'},

                   }
            }, 
           

          ]);


          res.status(200).json({
            status: 'success',
            data: {
              stats
            }
          });
    




    }catch (err){
      res.status(404).json({
        status : 'fail',
        message : 'Invalid Id Sent' ,
  
    })

    }


  }


  //Aggretation Pipelineing Solving Real World Problem

  
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
