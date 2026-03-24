import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ai-mern-assignment.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;