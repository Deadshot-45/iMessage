import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const host = isLocalhost ? "localhost" : window.location.hostname;
  return `http://${host}:3000/api`;
};

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

export const getSocketUrl = () => {
  return getBaseUrl().replace("/api", "");
};
