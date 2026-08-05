/* Helpers de grille — géométrie du plateau et occupation des cases. */
import {ROWS,COLS} from '../config.js';

export const key=(r,c)=>r*COLS+c;
export const inb=(r,c)=>r>=0&&r<ROWS&&c>=0&&c<COLS;
export const unitAt=(units,r,c)=>units.find(u=>u.hp>0&&u.r===r&&u.c===c);
export const bldAt=(blds,r,c)=>blds.find(b=>b.r===r&&b.c===c);
export const canStop=(units,u,r,c)=>{const o=unitAt(units,r,c);return !o||o===u;};
