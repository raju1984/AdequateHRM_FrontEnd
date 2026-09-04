import axios from "axios";

const api = axios.create({
  baseURL: "http://jupiterapi.adequateshop.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;