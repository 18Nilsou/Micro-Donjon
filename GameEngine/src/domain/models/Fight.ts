export interface Fight {
  id: string;
  heroId: number;
  mobIds: number[];
  status: 'active' | 'heroWon' | 'heroLost' | 'fled';
  turn: 'hero' | 'mobs';
  turnNumber?: number;
  actions?: {
    turn: number;
    actor: string;
    action: string;
    target?: string;
    damage?: number;
    result?: string;
  }[];
  startTime?: string;
  endTime?: string;
}