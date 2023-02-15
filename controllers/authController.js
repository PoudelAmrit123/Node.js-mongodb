const mongoose = require("mongoose");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { exists } = require("../models/userModel");

 const signToken = id =>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

 }

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

//   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
   const token = signToken(newUser._id)

  res.status(201).json({
    status: "success",
    token,
    data: {
      User: newUser,
    },
  });
});

   //Login 
   exports.login = catchAsync( async (req, res , next)=>{
        //   Here we store our enter email and password in our new const by destruturing the code i.e similar to writing 
        //   const email = ...{req.body.email}
       const {email , password} =req.body ;

    //    1) check whether emial and password is enter 
     if(!email  || !password) {
      return  next(new  AppError('Please Provide Email and password' ,400));
     }
    

    //   2) Check if enter password is true or not 

    const user = await User.findOne({ email }).select('+password');

    //   const correct =  await user.correctPassword(password , user.password);

      if(!user || !(await user.correctPassword(password , user.password))){
        return next(new AppError('Incorrect Email or Password' , 400))
      }




    //  3) send back the token 

          const token = signToken(user._id);
          res.status(200).json({
            status : 'success' , 
            token
          })

     






   });


   exports.protect = catchAsync( async (req , res , next)=>{

    // 1)Getting token and check if it is true 
       
    //  We have access to the header in the header in the req 
    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
           token = req.headers.authorization.split(' ')[1];
           
    }
    console.log(token);
   
         if(!token){
          return next( new AppError('You need to login First to Access the function'  , 401))
         }


      // 2)Verfication token 

      // 3)Check if user still exists 

      // 4)Check if user changed password after token was issued 


    next();
   })