// src/utils/cookieHelper.js
import Cookies from "universal-cookie";

const cookies = new Cookies();

/**
 * Set a browser cookie
 * @param {string} name
 * @param {any} value
 * @param {object} options
 */
export const setCookie = (name, value, options = {}) => {
  cookies.set(name, value, {
    path: "/",
    sameSite: "strict", // prevents CSRF
    secure: import.meta.env.VITE_NODE_ENV === "production", // only HTTPS in prod
    ...options,
  });
};

/** Get a browser cookie */
export const getCookie = (name) => cookies.get(name);

/** Remove a browser cookie */
export const removeCookie = (name, options = {}) => {
  cookies.remove(name, { path: "/", ...options });
};
