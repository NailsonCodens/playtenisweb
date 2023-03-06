import { asyncLocalStorage } from 'async-web-storage';
import styles from '../../styles/court.module.css'
import Image from 'next/image';
import court from '../../../public/court.png';
import users from '../../../public/users.png';
import clock from '../../../public/clock.png';
import { StatusCourt } from '../StatusCourt';
import { useState, useEffect } from 'react';
import { api } from '@/pages/api/api';
import { statusGame } from '@/utils/statusGame';
import { colorsCourt } from '@/utils/colorsCourt';
import { statusCourtText } from '@/utils/statusCourtText';
import dayjs from 'dayjs';
import socketio from '@/socketio';
import { typePlayerHome } from '@/pages';

type Props = {
  id: string,
  nameCourt: string,
  status: string,
  reloadCourts: boolean,
  reloadFetchCourts: () => void,
  checkQueue: () => void,
}

type gamePropsDTO = {
  start_time_game: string,
  end_time_game: string,
  time: number,
  players: [
    {
      id: string,
      type: string,
      name: string,
      registration: string,
    }    
  ]
};

export type DataObject = {
  id: string,
  date_game: string,
  court_id: string,
  modality_id: string,
  start_time_game: string,
  end_time_game: string,
  time: string
  players: Array<PlayersDTO>,
  modality: {
    id: string,
    name: string,
    amount_players: number, 
    time: string,
    status: string
  }
};

type PlayersDTO = {
  id: string;
  type: string;
  name: string;
  registration: string;
  status: string;
};

export type courtPropsDTO = {
  id: string;
  name: string;
  status: string;
}

export function Court({id, nameCourt, status, reloadCourts, reloadFetchCourts, checkQueue}: Props){

  const [teste, setTeste] = useState([]);
  const [gameCurrent, setGameCurrent] = useState(); 
  const [courtCurrentName, setCourtCurrentName] = useState();
  const [haveGame, setHaveGame] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayersDTO[]>([]);
  const [noGame, setNoGame] = useState('Sem jogo');
  const [modalityName, setModalityName] = useState('');
  const [statusBarColorCourt, setStatusBarColorCourt] = useState('');
  const [statusCourtBar, setStatusCourtBar] = useState('');
  const [statusGameBar, setStatusGameBar] = useState(statusGame.available);

  const [dateFinishGame, setDateFinishGame] = useState<string>(new Date().toISOString());
  const [timeGame, setTimeGame] = useState<number>(0);
  const [startDateGame, setStartDateGame] = useState('');
  const [endDateGame, setEndDateGame] = useState('');
  const [randonExecute, setRandonExecute] = useState(0);

  async function fetchStatusCourt(){
    asyncLocalStorage.removeItem(`STATUS_COURT_${id}`);
    asyncLocalStorage.removeItem(`STATUS_GAME_${id}`);

    const response = await api.get(`/games/game-court-current/${id}`);
    console.log(response.data);

    const {game, court} = response.data;

    console.log(game, court)


    let checkGame =  'no';

    if(game !== null){
      checkGame = 'yes';
      setModalityName(game.modality.name);
    }else{
      checkGame = 'no';
      setModalityName('');
    }

      setGameCurrent(game);
      setCourtCurrentName(court.name);
      game && game.players && setPlayers(game.players);    



      await asyncLocalStorage.setItem(`STATUS_COURT_${court.id}`, court.status);
      await asyncLocalStorage.setItem(`STATUS_GAME_${court.id}`, checkGame);  


      if(court.status === 'off' && game === null){
        cancelAllStatus();      
      }
  
      if(court.status === 'ok' && game === null){
        cancelAllStatus();      
      }    
  
      addColorCourtBarAndStatusCourtBar(game, court);
      mutateDataCourt(game);
  }

  function cancelAllStatus(){
    setHaveGame(false);
    setStatusAvailableCourtAfterCounterResets();
    setStartDateGame('');
    setEndDateGame('');
    reloadFetchCourts();   
    setTimeGame(0); 
    setModalityName('');
    setPlayers([]);
    setNoGame('Sem jogo');    
    setHaveGame(false); 
  }  

  function addColorCourtBarAndStatusCourtBar(game: gamePropsDTO, court: courtPropsDTO){
    if(!game){
      setStatusBarColorCourt(colorsCourt.available);
      setStatusCourtBar(statusCourtText.available);
      setStatusGameBar(statusGame.available);

      if(court.status === 'off'){
        setStatusBarColorCourt(colorsCourt.unavailable);
        setStatusCourtBar(statusCourtText.unavailable);
        setStatusGameBar(statusGame.unavailable);
      }
    }

    if(game){
      defineColorBarTextBarAndstatusGame(game);
      addDateFinishAndTimeGame(game);           
    }
  }
  
  function addDateFinishAndTimeGame(game: gamePropsDTO){
    setDateFinishGame(game.end_time_game);
    setTimeGame(game.time);
  }

  function mutateDataCourt(game: gamePropsDTO){
    if(game){
      setEndDateGame(dayjs(game.end_time_game).locale('pt-br').format('HH:mm'));
      setStartDateGame(dayjs(game.start_time_game).locale('pt-br').format('HH:mm'));
    }
  }

  function renderPlayers(){
    if(players.length > 0){
      let arrayPlayers: string[] = [];

      players.map((player, key) => {
        const newObjectPlayers: typePlayerHome = Object(player);

        let firstName = player.name.split(' ')[0];
        console.log(firstName);

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

      return(
        <div 
          className="players"
        >
          <div className="sidePlayers">
            {playersTogether}  
          </div>
        </div>
      );

    }
  }

  function defineColorBarTextBarAndstatusGame(game: gamePropsDTO){
    const coach = game.players.find(player => player.type === 'coach');

    if(game.players.length > 0 && coach){
      /*
      setStatusBarColorCourt(colorsCourt.class);
      setStatusGameBar(statusGame.class);
      setStatusCourtBar(statusCourtText.inUse);*/

    }else{
      setStatusCourtBar(statusCourtText.inUse);
      setStatusBarColorCourt(colorsCourt.inUse); 

      changeStatusGame(game.time);
    }    
  }  

  function changeStatusGame(time: number){
    if(time <= 16){
      setStatusGameBar(statusGame.closeEnd);
    }

    if(time > 16 && time < 40){
      setStatusGameBar(statusGame.inProgress);
    }
    
    if(time >= 40){
      setStatusGameBar(statusGame.start);
    }    
  }  

  function setStatusAvailableCourtAfterCounterResets(){
    setStatusCourtBar(statusCourtText.available);
    setStatusBarColorCourt(colorsCourt.available);  
    setStatusGameBar(statusGame.available);
  }

  async function CounterTimeGame(){    
    
/*    setTimeGame(Math.random())*/
    setRandonExecute(Math.random())

    const statusCortStorage = await asyncLocalStorage.getItem(`STATUS_COURT_${id}`);
    const statusGame = await asyncLocalStorage.getItem(`STATUS_GAME_${id}`);
    console.log(statusCortStorage);
    if(statusCortStorage !== 'off' && statusGame === 'yes'){
      console.log('executando aqui pq é diferente de off');
      const dateNow = dayjs();
      const dateGame = dayjs(dateFinishGame);
      const diffBetweenDate = dateGame.diff(dateNow, 'minute');  
      
      setTimeGame(diffBetweenDate);
      changeStatusGame(diffBetweenDate);
  
      if(diffBetweenDate === 0){
        setNoGame('Jogo acabando...');
        setTimeout(()=> {
          setStatusAvailableCourtAfterCounterResets();
          setStartDateGame('');
          setEndDateGame('');
          reloadFetchCourts();   
          setTimeGame(0); 
          setPlayers([]);
          setModalityName('');

          checkQueue();
          setNoGame('Sem jogo');
          asyncLocalStorage.removeItem(`STATUS_COURT_${id}`);
          asyncLocalStorage.removeItem(`STATUS_GAME_${id}`);    

          socketio.emit("WarningWebApp", courtCurrentName);
          socketio.off("WarningWebApp");
  
        }, 60800);
      }
    }else{
      console.log('Não posso contar');
    }
  }

  useEffect(() => {
    if(reloadCourts){
      fetchStatusCourt(); 
    }else{
      fetchStatusCourt(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadCourts])

  useEffect(() => {
    if(timeGame === 0){
    }else{
      setTimeout(() => {  
        console.log('executei uma vez');
        CounterTimeGame(); 
      }, 60000)    
    }
  })

/*
  useEffect(() => {
    const timer = window.setInterval(() => {
      if(timeGame === 0){
      }else{
        setTimeout(() => {  
          CounterTimeGame();          
        }, 60000)    
      }
    }, 1000);
    return () => { // Return callback to run on unmount.
      window.clearInterval(timer);
    };
  }, []); // Pass in empty array to run useEffect only on mount.
*/
  return(
    <div className={styles.court}>
      <p className={styles.nameCourt}>{nameCourt}</p>
      <div className={styles.containerImageCourt}>
        <Image
          alt='Court'
          src={court}
        />
      </div>
      <div className={styles.containerPlayers}>
        <div className={styles.boxIcon}>
          {
            players.length == 0 ?
            (
              <>
                <div className='empty'>
                </div>
              </>
            ):
            (
              <>
                <Image
                  alt='UsersIcon'
                  src={users}
                /> 
              </>
            )
          }
        </div>
        <div className={styles.players}>
          <p>{renderPlayers()}</p>
        </div>
      </div>
      <div className={styles.modality}>
        <p>{modalityName}</p>
      </div>      
      <div className={styles.containerClock}>
        <div className={styles.boxIcon}>
          <Image
            alt='Clock'
            src={clock}
          />
        </div>
        <div>
          <p>
            {
              startDateGame ? 
              `${startDateGame} até ${endDateGame}
              `
              :
              '00:00'
            }
          </p>
        </div>
      </div>
      <div className={styles.containerRestTime}>
        {timeGame > 0 ? `Tempo restante ${timeGame && timeGame.toString().padStart(2, '0')}:00`: noGame}

      </div>      
      <StatusCourt
        statusBar={statusCourtBar}
        colorCourt={statusBarColorCourt}
        statusGame={statusGameBar}
      />  
    </div>
  )
}