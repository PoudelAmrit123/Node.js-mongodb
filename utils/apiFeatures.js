class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
    filter() {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(el => delete queryObj[el]);
  
      // 1B) Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }
  module.exports = APIFeatures;

  
// The Code we wrote during building of the getAllTours routes is below:


    // req.query doesnot work for other filter method like sort limit page so we have to exclude those by making its extra Copy 


      /* ***********************  */
    // const queryObj = {...req.query};
//     const excludedObj = [ 'page' , 'sort' , 'limit' , 'page' , 'fields'];

//     excludedObj.forEach( el=> delete queryObj[el]);


// //  console.log(req.query , queryObj);



// // console.log(req.requestTime);
// //  Instead of req.obj we send back  filterd queryObj that doesnot have any of the above mentioned filterd object 
//   //  const tours = await Tour.find(req.query);
  
//     // We here await the query but we should also have other filtering so we make the query part separate and later await that query  
//   // const tours = await Tour.find(queryObj);

//   //  2) Advanced Filtering 
 
//  const queryObjToStr= JSON.stringify(queryObj);
// const queryStr=  queryObjToStr.replace(/\b(gte|gt|lt|lte)\b/g , match=> `$${match}` );
// let  query =  Tour.find(JSON.parse(queryStr));

//           // 3) Sorting 
//           if(req.query.sort){
//             //if we have any two element that have the same value while sorting we can make another element as second priority 
            
//             const sortBy = req.query.sort.split(',').join(' ');

//             // query = query.sort(req.query.sort);
//             query = query.sort(sortBy);
//           } else {
//             query = query.sort('-createdAt');
//           }


//           // 4) Limiting Fields 
//           if(req.query.fields){
//                const fieldsObj = req.query.fields.split(',').join(' ');
//                  query = query.select(fieldsObj);

//           }else{
//              query = query.select('-__v');
//           }


//           //  5) Pagination 

//           // Here we find out the page from the query and make it number by multipying it by 1 and declare 1 as an default value for the page  by using or operator
//            const page= req.query.page *1 || 1 ;    
//            const limit = req.query.limit *1 || 100 ;
//            const skip = ( page -1) * limit

//            query = query.skip(skip).limit(limit);
//            if(req.query.page){
//             const pageCount = await Tour.countDocuments();
//             if(skip  >= pageCount){
//               throw new Error('This Page doesnot Exit');
//             }
//            }

  