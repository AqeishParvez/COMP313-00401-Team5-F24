const jwt = require("jsonwebtoken");

const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Get the user's role from the token

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: `This action can only be performed by: ${roles}` });
    }
    next();
  };
};

module.exports = checkRole;
