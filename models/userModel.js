const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
       required : [true , 'The user name is required '],

    },
    email : {
        type : String ,
        required : [true , 'The email is required'],
        unique : true ,
         lowercase : true ,
        validate : [validator.isEmail  , 'Please Provide us the valid Email Address' ]
    },
    photo : String ,

    role : {
        type : String , 
        enum : [  'user' , 'admin' , 'lead-guide'] ,
        default : 'user' , 

    },
    password : {
        type : String ,
        required : [true , 'Please enter your password'],
        min : 8 ,
        select : false ,
    },
    passwordConfirm : {
        type : String , 
        required : [true , 'Please confirm Your password'],
        validate :{
                  //This only works on CREATE and SAVE.
             validator : function(el) {
                return el===this.password;
             }  , 

             message : 'Password  confirm need to be same as Password',


        }

    },

    passwordChangedAt : Date ,
    passwordResetToken : String , 
    passwordResetExpires : Date , 

});


  userSchema.pre('save' ,  async  function(next){
     //Return if password is not modified
   if(!this.isModified('password')) return  next();

            //Hashing the password with the cost of 12
         this.password = await  bcrypt.hash(this.password , 12);
         this.passwordConfirm = undefined ;
     
  })

 userSchema.pre('save' , function(next){
             
             if(!this.isModified('password')  || this.isNew) return next();

              this.passwordChangedAt = Date.now() -1000 ;
              next();

         })

   //Instance Method
   userSchema.methods.correctPassword =      async function (candidatePassword , userPassword){
     
    return   await bcrypt.compare(candidatePassword , userPassword);

   }

   userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt ){
         const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000 , 10) ;
  
        // console.log(this.passwordCreatedAt , JWTTimestamp);
        return JWTTimestamp < changedTimeStamp ;
    }
     //False Means Not chagned
    return false ;
   }


   userSchema.methods.createPasswordRestToken = function (){

     const resetToken =   crypto.randomBytes(32).toString('hex');

     this.passwordResetToken =
      crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');


 this.passwordResetExpires = Date.now() + 10 *60*1000 ;

 return resetToken ;

   }


const User = mongoose.model('User' ,userSchema);

 module.exports = User ;