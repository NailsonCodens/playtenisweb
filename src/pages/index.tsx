import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { useEffect, useState } from 'react'
import io from 'socket.io-client';
import { Header } from '@/components/Head';
import { Court, DataObject } from '@/components/Court';
import { api } from './api/api';
import users from '../../public/users.png';
import socketio from '@/socketio';

type CourtData = {
  id: string,
  name: string,  
};

type typeCourt = {
  id: string,
  name: string,
  status: string,
  game: DataObject
};

type queueType = {
  id: string,
  modality_id: string,
  players: [],
  played: string,
}

type typePlayerHome = {
  name: string,
}

export default function Home() {
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [reload, setReload] = useState(false);
  const [queue, setQueue] = useState<queueType[]>([]);
  const [showButton, setShowButton] = useState<boolean>(false);

  async function fetchCourts(){
    const response = await api.get('/courts');
    setCourts(response.data.list);
  }

  async function fetchQueue(){
    const response = await api.get('/queue/');
    setQueue(response.data)
  }

  function checkQueueExists(){
    /*console.log('check queue exists');

    if(queue.length > 0){
      setShowButton(true);
      console.log('libera botão apenas pro primeiro grupo  da fila de espera.');
    }

    if(queue.length <= 0){
      setShowButton(false);
      console.log('esconde o botão pq nao tem mais fila de espera');
    } */   
  }  

  function renderCourt(court: typeCourt){
    return (
      <Court
      key={court.id}
      id={court.id}
      nameCourt={court.name}
      status={court.status}
      reloadCourts={reload}
      reloadFetchCourts={() => fetchCourts()}
      checkQueue={() => checkQueueExists()}
    />  
    );
  }

  function renderQueue(players: string[], id: string, key: number){
    let arrayPlayers: string[] = [];

    players.map((player) => {
      const newObjectPlayers: typePlayerHome = Object(player);

      arrayPlayers.push(newObjectPlayers.name)
    });

    const playersTogether = arrayPlayers.join(' x ')

    if(playersTogether){
      return(
        <div 
          key={playersTogether}
          className="players"
        >
          <div className="icon-queue">
            <Image
              alt='UsersIcon'
              src={users}
            />
          </div>
          <div className="sidePlayers">
            <p>{playersTogether}</p>
          </div>
        </div>
      );  
    }
  }

  async function reloadFetchCourts(data){
    const response = await api.get('courts');
    console.log('rodou aqui realod');
    setReload(true);
    setCourts(response.data.list)
  }


  useEffect(() => {
    fetchCourts();
    fetchQueue();
  }, []);


  useEffect(() => {
    console.log('carregando')
    socketio.on("reloadResponse", (data) => {
      console.log(data);
      setReload(true);    
      reloadFetchCourts(data);
      fetchQueue();        
      setReload(false);
    });
    return () => {
      socketio.off('reloadApp')
      socketio.off('reloadResponse')
      setReload(false);
    }    
  }, []);


  return (
    <div>
      <Header/>
      <div className="container">
        <div className='courts'>
          {
            courts.map(court => {
              {return renderCourt(court)}
            })
          }                
        </div>    
        <div className='queueAndNotifications'>
          <div className="warnings">
              avisos
          </div>
          <div className="queues">
            <p className='queueTitle'>Fila de espera</p>            
            <div className="BoxQueue">
              {
                queue.map((queue, key) => {
                  {return renderQueue(queue.players, queue.id, key)}
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}
