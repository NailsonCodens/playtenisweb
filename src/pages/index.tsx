import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { useEffect, useState } from 'react'
import io from 'socket.io-client';
import { Header } from '@/components/Head';
import { Court, DataObject } from '@/components/Court';
import { api } from './api/api';
import users from '../../public/users.png';
import info from '../../public/info.png';
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

export type typePlayerHome = {
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

    const response = await api.get('/courts');
    setCourts(response.data.list);
  }

  async function fetchQueue(){
    const response = await api.get('/queue/');
    setQueue(response.data)
  }

  async function checkQueueExists(){
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


    players.map((player, key) => {
      const newObjectPlayers: typePlayerHome = Object(player);

      console.log(newObjectPlayers.name.split(' ')[0]);
  
      if(players.length === 2){
        if(key === 0){
          arrayPlayers.push(newObjectPlayers.name.split(' ')[0] + ' x ')
        }
  
        if(key === 1){
          arrayPlayers.push(newObjectPlayers.name.split(' ')[0])
        }  
      }else{
        if(key === 0){
          arrayPlayers.push(newObjectPlayers.name.split(' ')[0] + ' e ')
        }
  
        if(key === 1){
          arrayPlayers.push(newObjectPlayers.name.split(' ')[0])
        }         
        

        if(key === 2){
          arrayPlayers.push(' x ')

          arrayPlayers.push(newObjectPlayers.name.split(' ')[0] + ' e ')
        }         
        
        if(key === 3){
          arrayPlayers.push(newObjectPlayers.name.split(' ')[0] + '  ')
        }                 
      }


    });

    const playersTogether = arrayPlayers

    if(playersTogether){
      return(
        <div 
          key={key}
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

  async function addWarning(data: string){

    const response = await api.get('/queue/');

    if(response.data.length > 0){
      setWarnings(data);
      setRemoveWithTimeOut(true);   
      setModal(true);
      //setShineQueue(true);        
    }

    /*setTimeout(() => {
      setWarnings('');
      setModal(false);
    }, 10000);*/

    /*setTimeout(() => {

      setShineQueue(false);      
    }, 15000); */
  }

  useEffect(() => {
    socketio.on("warningWebAppResponse", (data) => {
      console.log('avisei aqui');
      console.log(queue.length);
      console.log(queue.length);
 
      addWarning(data);
/*
      if(queue.length > 0){

        console.log('avisei aqui 2');
        console.log('abri add warning');

        addWarning(data);        
      }*/
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

  useEffect(() => {
    socketio.on("responseHideModalWeb", (data) => {
      setModal(false);
      setReload(true);    
      reloadFetchCourts();
      fetchQueue();        
      setReload(false);      
    });
    return () => {
      socketio.off('hideModalWeb')
      socketio.off('responseHideModalWeb')
      setReload(false);
    }    
  }, []);


  return (
    <div>
      {
        modal? 
        (
          <>
            <div className='bakcgroundModal'>
              <div className="modal">
                <p className='title-modal'>Uma ou mais quadras foram liberadas!</p>
                <p className="attention">ATENÇÃO: </p>
                <p className='titleBoxCourts'>
                  {warnings} liberada, vá ao totem para iniciar seu jogo!
                </p>
                  <div className="boxCourtsModal">
                    <div >
                      <Image
                        alt='Informations'
                        src={info}
                        className="imageinfo"
                      />
                    </div>
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
            {modal}
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
