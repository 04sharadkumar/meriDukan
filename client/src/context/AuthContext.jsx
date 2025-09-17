import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { getCookie } from "../utils/cookieHelper"; // ✅ use cookieHelper

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchUser = async () => {

      const authToken = getCookie("authToken"); // ✅ get token using helper
      
      if (!authToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${authToken}` }, // send token
        });
        
        setUser(res.data.user);
      } catch (err) {
        console.error("User not authenticated:", err.response?.data?.message || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
