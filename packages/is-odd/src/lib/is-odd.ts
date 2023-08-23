import { isEven } from '@shawnponents/is-even';


export function isOdd(x: number): boolean {
  console.log("testing");
  console.log("testing logs");
  return !isEven(x);
}