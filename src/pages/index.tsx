import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { useEffect, useState } from 'react'
import io from 'socket.io-client';
import { Header } from '@/components/Head';
import { Court } from '@/components/Court';
import { api } from './api/api';

type CourtData = {
  id: string,
  name: string,  
};

export default function Home() {
  const [courts, setCourts] = useState<CourtData[]>([]);

  async function featchCourts(){
    const response = await api.get('/courts');
    setCourts(response.data.list);
  }

  useEffect(() => {
    featchCourts();
  }, []);

/*  let baseURL = 'https://playtenis.qosit.com.br/';
    
  const socketio = io(baseURL);    

  async function handleLogin(e) {
    socketio.emit("hello", 'passando masdasdsadensagem');
  }

  useEffect(() => {
    console.log('carregando')
    socketio.on("messageResponse", (data) => {
      console.log(data)
    });

    return () => {
      socketio.off('hello')
    }    
  }, [socketio]);*/

  return (
    <div>
      <Header/>
      <div className="container">
        <div className='courts'>
          {
            courts.map(court => (
              <Court 
                key={court.id}
                id={court.id}
                nameCourt={court.name}
              />
            ))
          }                
        </div>    
        <div className='queueAndNotifications'>
          dsdsad
        </div>
      </div>
    </div> 
  )
}
