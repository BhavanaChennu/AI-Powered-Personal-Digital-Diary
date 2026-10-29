import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://diary-backend-lb1x.onrender.com/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A login token lasts 24 hours and stops working if the backend's secret or database changed.
// The backend then answers 401/403 to every protected request, which used to leave Save, Search
// and AI buttons failing with vague errors. Send the user back to the login page instead.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;
    const url = (error.config && error.config.url) || "";
    const isLoginOrRegister = url.includes("/auth/"); // wrong password also returns
    if ((status === 401 || status === 403) && !isLoginOrRegister && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      sessionStorage.removeItem("pinVerified");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const register = (username, password) =>
  axios.post(`${API_BASE_URL}/auth/register`, { username, password });

export const login = (username, password) =>
  axios.post(`${API_BASE_URL}/auth/login`, { username, password });

// ---- Diary CRUD ----
const DIARY_URL = `${API_BASE_URL}/diary`;

export const getAllEntries = () => axios.get(DIARY_URL);
export const getEntryById = (id) => axios.get(`${DIARY_URL}/${id}`);
export const createEntry = (entry) => axios.post(DIARY_URL, entry);
export const updateEntry = (id, entry) => axios.put(`${DIARY_URL}/${id}`, entry);
export const deleteEntry = (id) => axios.delete(`${DIARY_URL}/${id}`); // soft delete -> trash

// ---- Trash ----
export const getTrash = () => axios.get(`${DIARY_URL}/trash`);
export const restoreEntry = (id) => axios.post(`${DIARY_URL}/${id}/restore`);
export const permanentlyDeleteEntry = (id) => axios.delete(`${DIARY_URL}/${id}/permanent`);

// ---- Search / filter ----
export const searchEntries = (keyword) => axios.get(`${DIARY_URL}/search`, { params: { keyword } });
export const getFavorites = () => axios.get(`${DIARY_URL}/favorites`);
export const getByMood = (mood) => axios.get(`${DIARY_URL}/mood/${mood}`);
export const getByTag = (tag) => axios.get(`${DIARY_URL}/tag/${tag}`);

// ---- Todos ----
const TODO_URL = `${API_BASE_URL}/todos`;

export const getTodos = () => axios.get(TODO_URL);
export const createTodo = (text) => axios.post(TODO_URL, { text });
export const updateTodo = (id, todo) => axios.put(`${TODO_URL}/${id}`, todo);
export const toggleTodo = (id) => axios.patch(`${TODO_URL}/${id}/toggle`);
export const deleteTodo = (id) => axios.delete(`${TODO_URL}/${id}`);

// ---- Profile / PIN ----
const PROFILE_URL = `${API_BASE_URL}/profile`;

export const getProfile = () => axios.get(PROFILE_URL);
export const updateProfile = (username) => axios.put(PROFILE_URL, { username });
export const changePassword = (currentPassword, newPassword) =>
  axios.put(`${PROFILE_URL}/password`, { currentPassword, newPassword });
export const setPin = (pin) => axios.post(`${PROFILE_URL}/pin`, { pin });
export const removePin = () => axios.delete(`${PROFILE_URL}/pin`);
export const verifyPin = (pin) => axios.post(`${PROFILE_URL}/pin/verify`, { pin });

// ---- Upload ----


// ---- AI (Groq-powered) ----
const AI_URL = `${API_BASE_URL}/ai`;
export const summarizeEntries = (days) => axios.post(`${AI_URL}/summarize`, { days });
export const summarizeEntryText = (text) => axios.post(`${AI_URL}/summarize-entry`, { text });
export const polishText = (text) => axios.post(`${AI_URL}/polish`, { text }); // returns { results: [...] }
export const extendText = (text) => axios.post(`${AI_URL}/extend`, { text });
export const shortenText = (text) => axios.post(`${AI_URL}/shorten`, { text });
export const smartLayoutText = (text) => axios.post(`${AI_URL}/layout`, { text });