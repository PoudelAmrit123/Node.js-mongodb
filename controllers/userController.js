const User = require('./../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const { findByIdAndUpdate } = require('./../models/userModel');



   const filterObj = (obj , ...allowedFields) =>{
    const newObj = {} ;
    Object.keys(obj).forEach( el => {
      if ( allowedFields.includes(el)) newObj[el] = obj[el]; 
    });
    return newObj ;
   }




exports.getAllUsers = catchAsync( async (req, res , next) => {
 
   const users = await User.find();

  res.status(200).json({
    status: 'success',
     data : {
      users ,
     }
  });
});


 exports.updateMe = async ( req , res , next)=>{

      //  1 ) sending error if some one try to update the password 
         if(req.body.password || req.body.passwordConfirm ){
          return next( new AppError('This is not the route for changing the password' , 401));
         }

      //  2) Sending the documention 
 
      //  we donot use User.save() bcz we donot want password and passwordConfirm so better idea is to use findByIdAndUpdate 
 
      const filteredBody = filterObj(req.body , 'name' , 'email');
       //Here filterObj is function which return the filtered Object 

        const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , { 
          new : true ,
          runValidators : true ,
        })
        //Here we find the id by using findbyidandUpdate and filterdobj are those obj where we want to update basically not password , role etc and update it 


              res.status(200).json({
                status : 'success' ,
                data : {
                  user : updatedUser , 
                } 

              })
   
 }


exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
