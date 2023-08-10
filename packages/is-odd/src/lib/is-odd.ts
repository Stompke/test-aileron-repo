import { isEven } from '@shawnponents/is-even';


export function isOdd(x: number): boolean {
  return !isEven(x);
}