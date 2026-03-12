// src/services/authService.js
import api from "./api"

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials)
  return response.data
}

export const getProfile = async () => {
  const response = await api.get("/auth/me")
  return response.data
}
