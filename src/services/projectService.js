// src/services/projectService.js
import api from "./api"

export const getProjects = async () => {
  const response = await api.get("/projects")
  return response.data
}

export const addProject = async (data) => {
  const response = await api.post("/projects", data)
  return response.data
}

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data)
  return response.data
}

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`)
  return response.data
}
