// ProtectedAdminRoute.jsx
import { Navigate } from "react-router-dom";
import { getCookie } from "../utils/cookieHelper";

const ProtectedAdminRoute = ({ children }) => {
  const authToken = getCookie("authToken");
  const isAdmin = getCookie("isAdmin");

  if (!authToken) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/notfound" replace />;

  return children;
};

export default ProtectedAdminRoute;
