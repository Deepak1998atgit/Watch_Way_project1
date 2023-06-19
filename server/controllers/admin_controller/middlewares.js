const multer=require("multer");




exports.checkNotLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/adminLogin');
    }
};







exports.checkLoggedIn = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/adminLogin');
    } else {
        next();
    }
};



//   var storagee = multer.diskStorageee({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
//   });

// exports.uploadee = multer({
//     storage: storage,
//   }).array("photo", 10); 


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
  });
  
  exports.upload = multer({ storage: storage }).array('photo', 10);




  


  



