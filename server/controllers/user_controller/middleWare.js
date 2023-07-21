const jwt = require("jsonwebtoken");

//jwt auth
exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    const allowedRoutes = ['/', '/shop'];
    if (allowedRoutes.includes(req.path)) {
      
      next();
      return


    }
    const routes = ['/singleProduct/', '/sortProductByPrice'];

    if (routes.some(route => req.path.startsWith(route))) {
     
      next();
      return

    }
    return res.status(401).redirect("/userSignIn");

  }

  const secret = process.env.SECRET_KEY;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.clearCookie('jwt');

      return res.status(403).redirect("/");

    }
   
    req.user = decoded;
    next();

  });
}






//is loged in check
exports.isLogedIn = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {

    next();
  } else {
    const secret = process.env.SECRET_KEY;
    jwt.verify(token, secret, (err, decoded) => {

      if (err) {
        res.render("userSignIn");

      } else {

        res.redirect("/");
      }
    });
  }
};








