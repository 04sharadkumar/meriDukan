// utils/authHelpers.js
import jwt from "jsonwebtoken";

export const getUserIdFromReq = (req) => {
  // try authorization header first
  const authHeader = req.headers.authorization || (req.cookies && `Bearer ${req.cookies.authToken}`);
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};
