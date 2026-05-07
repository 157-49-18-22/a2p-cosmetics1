import API_BASE_URL from './apiConfig.js';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;

export default API_BASE_URL;
