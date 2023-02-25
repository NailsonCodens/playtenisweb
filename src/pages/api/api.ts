import axios from "axios";

const api = axios.create({
    baseURL: 'https://playtenis.qosit.com.br/',
    headers: {'Content-Type': 'application/json'}
});

export {api};