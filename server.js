
const dotenv = require('dotenv'); 
const { request } = require('express');
const mongoose = require('mongoose');

dotenv.config({ path : './config.env'})
const app = require('./app');
const { doc } = require('prettier');

 const db = process.env.DATABASE.replace('<PASSWORD>' , process.env.DATABASE_PASSWORD);

  mongoose.connect(db , {
   useUnifiedTopology: true , 
   useNewUrlParser :true ,
   useCreateIndex : true , 
   useFindAndModify : false , 
  }).then( ()=> console.log('DB Connection is Successful') )



 

    
   //Now to can create the document and perfrom the different CRUD operation on This Model

    // const testTour = new Tour ({
    //   name : "The park Camper" ,
    //   price : 497 , 
    //   rating : 4.7 ,
    // })

    // //Now saving the TestTour
    // testTour.save()
    // .then( doc =>{
    //   console.log('DB is Saved')
    // })
    // .catch( err => {
    //   console.log('Error Occured 💥' , err);
    // })








const port = process.env.port ||  3000;
//  console.log(app.get('env'));
// console.log(process.env);
app.listen(port, () => {
   console.log(`App running on port ${port}...`);
});

 
