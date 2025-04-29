import { sleep } from "./sleep.ts";

export async function forever<T>(f: () => Promise<T>): Promise<T> {
  while (true) {
    try {
      return await f();
    } catch (error) {
      console.error(error);
      await sleep(100);
    }
  }
}
