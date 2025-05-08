import { io } from 'socket.io-client';

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io("https://task-manager-backend-emo1.onrender.com", { 
      withCredentials: true,
      // Add these options if you encounter CORS issues:
      transports: ['websocket', 'polling'], // Use both transports
      upgrade: true,
    });
  }
  return socket;
};

export default getSocket;
