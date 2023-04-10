import axios from "axios";

const api = axios.create({
    baseURL: 'http://426b-201-14-34-109.ngrok-free.app/',
    headers: {'Content-Type': 'application/json'}
});

export {api};