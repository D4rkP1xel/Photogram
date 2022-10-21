import axios from 'axios'


export default axios.create({baseURL: process.env.BACKEND/*|| 'http://localhost:3001'*/})
