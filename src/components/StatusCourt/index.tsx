import { useState } from 'react';
import styles from '../../styles/statuscourt.module.css'

type jointStatus = {
  statusBar: string,
  colorCourt:string,
  statusGame: {
    text: string,
    color: string,  
  }
}

export function StatusCourt({statusBar, colorCourt, statusGame}: jointStatus){
  if(colorCourt === 'available'){
    console.log('dda');
  }

  return (
    <div 
      style={{ 'background': colorCourt }}
      className={styles.container} 
    >
      <div className={styles.statusBar}>
        {statusBar}
      </div>
      <div>
        <div
          style={{ 'background': statusGame.color }}        
          className={styles.statusGame}
        >
          { statusGame.text}
        </div>
      </div>
    </div>
  );
}