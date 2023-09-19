import { isEven } from '@otherponents/is-even';


export function isOdd(x: number): boolean {
  console.log("test 6");
  return !isEven(x);
}