const jwt = require("jsonwebtoken");
exports.authentication = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    const error = new Error("Please Login");
    error.status = 401;
    return next(error);
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return next(error);
    }
    req.user = { id: payload.id, admin: payload.admin };
  });
  next();
};
