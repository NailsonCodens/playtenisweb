import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { useEffect, useState } from 'react'
import io from 'socket.io-client';
import { Header } from '@/components/Head';
import { Court, DataObject } from '@/components/Court';
import { api } from './api/api';
import users from '../../public/users.png';
import socketio from '@/socketio';
import { asyncLocalStorage } from 'async-web-storage';

type CourtData = {
  id: string,
  name: string,  
  status: string
};

type typeCourt = {
  id: string,
  name: string,
  status: string,
  game: DataObject,
  court: CourtData
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
  const [warnings, setWarnings] = useState<string>('');
  const [removeWithTimeOut, setRemoveWithTimeOut] = useState(false);
  const [modal, setModal] = useState<boolean>(false);
  const [shineQueue, setShineQueue] = useState<boolean>(false);

  async function fetchCourts(){
    const storage = await asyncLocalStorage.getItem(`warnings`);

    if(storage){
      setWarnings(storage);
    }

    const response = await api.get('/courts');
    setCourts(response.data.list);
  }

  async function fetchQueue(){
    const response = await api.get('/queue/');
    setQueue(response.data)
  }

  function checkQueueExists(){
    if(queue.length > 0){
      setShowButton(true);
      console.log('libera botão apenas pro primeiro grupo  da fila de espera.');
    }

    if(queue.length <= 0){
      setShowButton(false);
      console.log('esconde o botão pq nao tem mais fila de espera');
    }  
  }


  function renderCourt(court: { id: string; name: string; status: string; }){
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
            <p className={shineQueue && key === 0 ? 'shine': ''}>
              {playersTogether}  
            </p>
          </div>
          <div className={shineQueue && key === 0 ? 'shine-btn': 'shinehidde'}>
            <p className="textShine-btn">Vá ao totem!</p>
          </div>
        </div>
      );  
    }
  }

  async function reloadFetchCourts(){
    const response = await api.get('courts');
    setReload(true);
    setCourts(response.data.list)
  }

  function renderWarning(warning: string, key: number){
    return(
      <div className='warningBox' key={key}>
        <p className="warning">{warning}</p>
      </div>
    );
  }

  async function addWarning(data: string){
    setWarnings(data);
    setRemoveWithTimeOut(true);   

    setModal(true);

    setShineQueue(true);

    setTimeout(() => {
      hideWarning()
    }, 10000);
  }

  useEffect(() => {
    socketio.on("warningWebAppResponse", (data) => {
      if(queue.length > 0){
        addWarning(data);
      }
    });
    
    return () => {
      socketio.off("warningWebAppResponse");
      socketio.off("WarningWebApp");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketio]);

  async function hideWarning(){
    await asyncLocalStorage.removeItem(`warnings`);
    await asyncLocalStorage.removeItem(`hideMessage`);
     setModal(false);
     setWarnings('');

     setTimeout(() => {

      setShineQueue(false);      
    }, 15000); 
  }

  useEffect(() => {
    fetchCourts();
    fetchQueue();
    asyncLocalStorage.setItem('hideMessage', 'false');
  }, []);


  useEffect(() => {
    socketio.on("reloadResponse", (data) => {
      console.log('execute');
      setReload(true);    
      reloadFetchCourts();
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
      {
        modal  ? 
        (
          <>
            <div className='bakcgroundModal'>
              <div className="modal">
                <p className='title-modal'>Quadra(s) foram liberada(s)!</p>
                <p className="attention">ATENÇÃO: </p>
                <p className='titleBoxCourts'>
                  Quadra {warnings} liberada, vá ao totem para iniciar seu jogo!
                </p>
                  <div className="boxCourtsModal">
                </div>  
              </div>          
            </div>
          </>
        ) :
        (<></>) 
      }
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
          <div className="queues">
            <p className='queueTitle'>Fila de espera</p>            
            <div className="BoxQueue">
              {
                queue.length > 0 ?
                  queue.map((queue, key) => {
                    {return renderQueue(queue.players, queue.id, key)}
                  })
                :
                (
                  <>
                    <div className='warningBoxEmpty'>
                      <p className="warningEmpty">0 jogadores na fila de espera</p>
                    </div>
                  </>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}
