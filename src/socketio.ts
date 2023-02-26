import io from 'socket.io-client';


let baseURL = 'https://playtenis.qosit.com.br/';

const socketio = io(baseURL);
export default socketio;
