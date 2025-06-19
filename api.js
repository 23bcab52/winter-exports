import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
const TOKEN = "54c41c77ed78cfbdb4a3a2da6c834ada6f2b32db"; // Replace with your actual token

const config = {
  headers: { Authorization: `Token ${TOKEN}` },
};

export const getBankEntries = async () => {
  const response = await axios.get(`${API_BASE_URL}/entries/`, config);
  return response.data;
};

export const addBankEntry = async (entry) => {
  const response = await axios.post(`${API_BASE_URL}/entries/`, entry, config);
  return response.data;
};

export const updateBankEntry = async (id, data) => {
  const response = await axios.patch(`${API_BASE_URL}/entries/${id}/`, data, config);
  return response.data;
};

export const deleteBankEntry = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/entries/${id}/`, config);
  return response.data;
};

export const getSummaryByDateOrMonth = async ({ date, month, year }) => {
  let url = `${API_BASE_URL}/entries/summary/`;
  if (date) {
    url += `?date=${date}`;
  } else if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  const response = await axios.get(url, config);
  return response.data;
};