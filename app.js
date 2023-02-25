const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');



const app = express();
app.use(helmet());

const limiter = rateLimit({
  max : 100 ,
  windowMs : 60 * 60 *1000,
  message : 'To many request .Try after after an hour .'
  
})

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api' ,limiter)
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

  
// const port = 3000;
// app.listen(port, () => {
//    console.log(`App running on port ${port}...`);
// });


module.exports = app;
