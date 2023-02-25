import styles from '../../styles/court.module.css'
import Image from 'next/image';
import court from '../../../public/court.png';
import users from '../../../public/users.png';
import clock from '../../../public/clock.png';
import { StatusCourt } from '../StatusCourt';
import { useState, useEffect } from 'react';
import { api } from '@/pages/api/api';

type CourtProps = {
  id: string,
  nameCourt:string,
};

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

export function Court({id, nameCourt}: CourtProps){
  const [teste, setTeste] = useState([]);
  const [gameCurrent, setGameCurrent] = useState(); 
  const [players, setPlayers] = useState([]);

  async function fetchStatusCourt(){
    const response = await api.get(`/games/game-court-current/${id}`);
    console.log(response.data);

    //const {game, court} = response.data;

    //console.log(game, court)

    //let checkGame =  'no';

    /*
    if(game !== null){
      checkGame = 'yes';
    }else{
      checkGame = 'no';
    }*/

    /*
      setGameCurrent(game);
      game && game.players && setPlayers(game.players);    
    */
  }

  useEffect(() => {
    fetchStatusCourt();
  }, [])

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
          <Image
            alt='UsersIcon'
            src={users}
          />
        </div>
        <div className={styles.players}>
          <p>0 jogadores</p>
        </div>
      </div>
      <div className={styles.containerClock}>
        <div className={styles.boxIcon}>
          <Image
            alt='Clock'
            src={clock}
          />
        </div>
        <div className={styles.clock}>
          <p>14:00 até 15:00</p>
        </div>
      </div>
      <StatusCourt
        statusBar=""
        colorCourt=""
        statusGame={teste}
      />  
    </div>
  )
}