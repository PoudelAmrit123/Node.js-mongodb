const mongoose = require('mongoose');
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
    password : {
        type : String ,
        required : [true , 'Please enter your password'],
        min : 8 ,
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

    }

});


  userSchema.pre('save' ,  async  function(next){
     //Return if password is not modified
   if(!this.isModified('password')) return  next();

            //Hashing the password with the cost of 12
         this.password = await  bcrypt.hash(this.password , 12);
         this.passwordConfirm = undefined ;
     
  })

const User = mongoose.model('User' ,userSchema);

 module.exports = User ;