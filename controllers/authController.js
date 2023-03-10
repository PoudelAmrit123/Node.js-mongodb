const mongoose = require("mongoose");
 const crypto = require('crypto');
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


 const createSendToken = (user , statusCode , res)=>{

  const token = signToken(user._id);

//   const expiresInDays = process.env.JWT_COOKIE_EXPIRES_IN || 7;
// const cookiesOptions = {
//   expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
//   httpOnly: true,
// };


  // if(process.env.NODE_ENV==='production') cookiesOptions.secure = true ;
  
  res.cookie('jwt' , token );

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user ,
    },
  });
 }


 

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
   createSendToken(newUser , 201 , res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     User: newUser,
  //   },
  // });
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
  createSendToken(user , 200 , res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
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

  if (currentUser.changePasswordAfter(decoded.iat)) {
    next(new AppError("Password have been changed Recently", 401));
  }

  req.user = currentUser;

  //Now Grant Access to the Protected Data
  next();
});

//here we write our middleware function in wrapper bcz  we have argument i.e roles to be passed on middleware and we cannot do it directly
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //Checking if the user is admin or tour-guide and access the funtion then
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You donot have permission to perform this action Contact Admin",
          403
        )
      );
    }

    next();
  };
};



exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on enterd email
           console.log(req.body);
  // const user = await User.findOne({ email: req.body.email });
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User email is not found on database ", 404));
  }
  // 2) Create unique token for password reset
  const resetToken = user.createPasswordRestToken();

  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  // 3) Send the token to the user

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget you password .Reset here ${resetURL} .If not plz ignore this message!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your reset password token (valid for 10min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset Password Token Creatd ",
      token ,
    });
  } catch (err) {
  
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),


      await user.save({ validateBeforeSave: false });

     return  next( new AppError('We cannot send Email' , 500));
  }

  next();
});



exports.resetPassword =  catchAsync( async (req, res, next) => {
  //  1) Get user based on token

    const hashedToken =   crypto.createHash('sha256').update(req.params.token).digest('hex');

    // Here we encrypt the token stored on database and store that on hashedtoken and now we compare this with our encypted token store on forgetPassoword 
 
    const user =   await User.findOne({ passwordResetToken : hashedToken  , passwordResetExpires : { $gt : Date().now() }});

    
       

  // 2) If token exists and not expired then set the user new password 
  if(!user){
    return next( new AppError('Token donot match to the user'));

  }
  user.password = req.body.password ;
  user.confirmPassword = req.body.confirmPassword ;
  user.passwordResetToken = undefined ;
  user.passwordResetExpires = undefined ;
      
           await  user.save() ; 




  // 3) And update the passwordChangedAt property to current date          
    // changePasswordAfter


    //  4)Log the user in and send jwt 
    createSendToken(newUser , 200 , res);
    // const token = signToken(newUser._id);

    // res.status(200).json({
    //   status: "success",
    //   token,
       
    // });



});


exports.updatePassword = catchAsync(async (req , res, next)=>{

      // 1) get the user from the collection 
             const user = await  User.findById(req.user.id).select('+password');

      // 2) Check if posted current password is correct 

       if(! await  user.correctPassword(req.body.passwordCurrent , user.password)){
        return next( new AppError('The password is not Correct' , 401));
       }

      // 3) If so update the password 
       user.password = req.body.password ; 
       user.passwordConfirm = req.body.passwordConfirm ;
       user.save();

      // 4) log the user in and create JWT 
      createSendToken(user , 200 , res);
      // const token = signToken(user._id);

      // res.status(200).json({
      //   status: "success",
      //   token,
      //   data: {
      //     User
      //   },
      // });

}



)








