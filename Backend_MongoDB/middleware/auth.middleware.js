import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
  try {
    //get the token from cookie or headers
    // if token not then return res
    // decode the jwt token
    // set decode data to res.user
    console.log(req.cookies);
    let token = req.cookies?.token;
    console.log("Token found: ", token ? "YES" : "NO");

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded data: ", decoded);
    req.user = decoded;

    next();
  } catch (error) {
    console.log("Auth middleware failure");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
