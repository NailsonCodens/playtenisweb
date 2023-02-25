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
  return (
    <div className={styles.container}>
      <div>
        Disponível
      </div>
      <div>
        <div>
          Para uso
        </div>
      </div>
    </div>
  );
}