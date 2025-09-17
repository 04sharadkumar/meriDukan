import { Navigate } from 'react-router-dom';
import { getCookie } from "../utils/cookieHelper";

const ProtectedRoute = ({ children }) => {

  const authToken = getCookie('authToken');

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
