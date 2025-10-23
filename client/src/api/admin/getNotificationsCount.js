// src/api/admin/getNotificationsCount.js
import axios from "axios";
import { getCookie } from "../../utils/cookieHelper";

export const getNotificationsCount = async () => {
  try {
    const authToken = getCookie("authToken");
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    const res = await axios.get(
      "http://localhost:5000/api/admin/notifications/count",
      { headers }
    );

   

    // Use the correct path based on backend response
    return res.data?.data?.unread ?? 0; // Returns unread count
  } catch (err) {
    console.error("Error fetching notifications count:", err);
    return 0; // fallback
  }
};
