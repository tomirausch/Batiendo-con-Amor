import axios from 'axios';

// Creamos una instancia centralizada
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // La URL de tu Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;