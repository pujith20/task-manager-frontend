import { io } from 'socket.io-client';

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001", { 
      withCredentials: true,
      // Add these options if you encounter CORS issues:
      transports: ['websocket', 'polling'], // Use both transports
      upgrade: true,
    });
  }
  return socket;
};

export default getSocket;
