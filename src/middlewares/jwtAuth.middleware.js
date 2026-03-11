import jwt from "jsonwebtoken";

const jwtAuth = (req, res, next) => {
  const { jwtToken } = req.cookies;

  if (!jwtToken) {
    res.locals.userName = null;
    res.locals.userId = null;
    res.locals.email = null;
    res.locals.avatar = null;

    return next();
  }

  jwt.verify(jwtToken, "CodingNinjas2024", (err, decoded) => {
    if (err) {
      res.locals.userName = null;
      res.locals.userId = null;
      res.locals.email = null;
      res.locals.avatar = null;

      return next();
    }
    res.locals.userId = decoded.userId;
    res.locals.userName = decoded.userName;
    res.locals.email = decoded.userEmail;
    res.locals.avatar = decoded.avatar;

    next();
  });
};

export default jwtAuth;
