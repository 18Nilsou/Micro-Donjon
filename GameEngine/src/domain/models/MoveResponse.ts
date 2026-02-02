import { Position } from "./Position";
import { Fight } from "./Fight";

export interface MoveResponse {
    success: boolean;
    position: Position | undefined;
    roomId: string;
    encounter?: {
        happened: boolean;
        fight?: Fight;
        mob?: any; // Mob instance from game state
    };
}