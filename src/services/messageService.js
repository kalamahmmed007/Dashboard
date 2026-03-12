// src/services/messageService.js
import api from "./api"

export const getMessages = async () => {
  const response = await api.get("/messages")
  return response.data
}

export const sendMessage = async (data) => {
  const response = await api.post("/messages", data)
  return response.data
}

export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}`)
  return response.data
}
