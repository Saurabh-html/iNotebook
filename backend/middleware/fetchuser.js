const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET;

const fetchuser = (req, res, next) => {

  const token = req.header('auth-token');

  // CHECK TOKEN EXISTS
  if (!token) {

    return res.status(401).json({
      success: false,
      error: "Please authenticate using a valid token"
    });
  }

  try {

    // VERIFY ACCESS TOKEN
    const data = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    );

    req.user = data.user;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      error: "Session expired. Please login again"
    });
  }
};

module.exports = fetchuser;