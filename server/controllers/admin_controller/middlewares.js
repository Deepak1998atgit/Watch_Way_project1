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



  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
  });

exports.upload = multer({
    storage: storage,
  }).single("photo");

