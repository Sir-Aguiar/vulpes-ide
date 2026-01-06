import axios from "axios";

const API = axios.create({
  baseURL: process.env.API_URL ? "http://localhost:8080" : process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
