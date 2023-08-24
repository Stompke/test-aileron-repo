import { isEven } from '@shawnponents/is-even';


export function isOdd(x: number): boolean {
  console.log("test 3");
  return !isEven(x);
}