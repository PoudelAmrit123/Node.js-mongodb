const mongoose = require("mongoose");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { exists } = require("../models/userModel");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt : req.body.passwordChangedAt  ,
  });

  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      User: newUser,
    },
  });
});

//Login
exports.login = catchAsync(async (req, res, next) => {
  //   Here we store our enter email and password in our new const by destruturing the code i.e similar to writing
  //   const email = ...{req.body.email}
  const { email, password } = req.body;

  //    1) check whether emial and password is enter
  if (!email || !password) {
    return next(new AppError("Please Provide Email and password", 400));
  }

  //   2) Check if enter password is true or not

  const user = await User.findOne({ email }).select("+password");

  //   const correct =  await user.correctPassword(password , user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password", 400));
  }

  //  3) send back the token

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});



exports.protect = catchAsync(async (req, res, next) => {
  // 1)Getting token and check if it is true

  //  We have access to the header in the header in the req
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError("You need to login First to Access the function", 401)
    );
  }

  // 2)Verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3)Check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(new AppError("User Doesnot exits anyMore", 401));
  }

  // 4)Check if user changed password after token was issued

  if(currentUser.changePasswordAfter(decoded.iat)){
    next( new AppError('Password have been changed Recently' ,401));
  };

      req.user = currentUser ;

  //Now Grant Access to the Protected Data
  next();
});

  //here we write our middleware function in wrapper bcz  we have argument i.e roles to be passed on middleware and we cannot do it directly 
exports.restrictTo =   (...roles)=>{
  return ( req , res , next)=>{

    //Checking if the user is admin or tour-guide and access the funtion then
  if(!roles.includes(req.user.role)){
    return next( new AppError('You donot have permission to perform this action Contact Admin' , 403));
  };

  next();

  }
}


exports.forgetPassword =  catchAsync(  async (req , res , next)=>{
    // 1) Get the user based on enterd email 

        const user =    await   User.findOne({email : req.body.email})
     if(!user){
      return next( new AppError('User email is not found on database ' , 404));
     }
    // 2) Create unique token for password reset 
      const resetToken =    user.createPasswordRestToken();

      console.log(resetToken);
           await  user.save({ validateBeforeSave : false} );
  
    // 3) Send the token to the user 
         
     const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}` ;
       
      const message = `Forget you password .Reset here ${resetUrl} .If not plz ignore this message!` ;

        try{

          await sendEmail({
            email : user.email ,
            subject: "Your reset password token (valid for 10min)",
            message ,
          });
    
          res.status(200).json({
            status : 'success' , 
            message : 'Reset Password Token Creatd ',
          })
    

        }catch(err){

          this.reset
          this.passwordResetToken = undefined , 
          this.passwordResetExpires = undefined , 
          await  user.save({ validateBeforeSave : false} )

        }
    

     

  
});



exports.resetPassword = (req , res , next)=>{}






