const jwt = require("jsonwebtoken");


exports.authenticateToken = (req, res, next) => {      // Middleware to authenticate JWT
    const token = req.cookies.jwt;                     // const token = req.cookies.jwt;
    if (!token) {
        return res.sendStatus(401).json({ message: "not valid login" });
    }
    const secret = process.env.SECRET_KEY;
    jwt.verify(token, secret, (err, decoded) => {     // Verify the token
        if (err) {
            return res.sendStatus(403).json({ message: err });
        }
        req.user = decoded;
        console.log(req.user, "token on authenticateToken");  // Store the decoded token in the request object for further use

        
        next();
        
    });
}


exports.isLogedIn = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
      // User is not logged in, proceed to the next middleware or route
       next();
    } else {
      const secret = process.env.SECRET_KEY;
      jwt.verify(token, secret, (err, decoded) => {
        // Verify the token
        if (err) {
          res.render("userSignIn");
          
        } else {
          // User is logged in, prevent access to userSignIn and previous pages
          res.redirect("/homePage"); // Change "/dashboard" to your desired page
        }
      });
    }
  };
  







