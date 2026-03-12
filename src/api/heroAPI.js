// /src/api/heroAPI.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/heroes";

// fetch all hero slides
export const fetchHeroSlides = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// add a hero slide
export const addHeroSlide = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// delete a hero slide
export const deleteHeroSlide = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// update a hero slide
export const updateHeroSlide = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};