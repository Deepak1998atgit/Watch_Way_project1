const multer = require("multer");
const jwt = require("jsonwebtoken");


exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.adminJwt;
  const secret = process.env.SECRET_KEY;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).redirect("/adminLogin")
    }
    req.user = decoded;
    next();

  });
}





exports.isLogedIn = (req, res, next) => {
  const token = req.cookies.adminJwt;
  if (!token) {
    next();
  } else {
    const secret = process.env.SECRET_KEY;
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.render("adminLogin");
      } else {
        res.redirect("/adminDashBoard");
      }
    });
  }
};











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











