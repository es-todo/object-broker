import assert from "node:assert";
import { forever } from "./forever.ts";
import { ObjectChannel } from "./object-channel.ts";
import axios from "axios";

async function fetch_event_t(): Promise<number> {
  return forever(async () => {
    const x = await axios.get("http://object-reducer:3000/object-apis/get-t");
    assert(typeof x.data === "number");
    return x.data;
  });
}

type change = {
  i: number;
  type: string;
  id: string;
  data: any;
};

async function poll_change_set(t: number): Promise<change[]> {
  return forever(async () => {
    const x = await axios.get(
      `http://object-reducer:3000/object-apis/poll-change-set?t=${t}`
    );
    return x.data as change[];
  });
}

export class ObjectChannelManager {
  private channels: Map<string, Map<string, ObjectChannel>> = new Map();

  constructor() {
    fetch_event_t()
      .then(async (t) => {
        console.log({ time_now: t });
        while (true) {
          t += 1;
          const data = await poll_change_set(t);
          for (const x of data) {
            const channel = this.get_channel(x.type, x.id);
            channel.notify_change(t, x.i, x.data);
          }
          console.log(data);
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  public get_channel(type: string, id: string): ObjectChannel {
    const m0 = this.channels.get(type);
    if (!m0) {
      const channel = new ObjectChannel(type, id);
      const m0 = new Map<string, ObjectChannel>();
      m0.set(id, channel);
      this.channels.set(type, m0);
      return channel;
    }
    const channel = m0.get(id);
    if (!channel) {
      const channel = new ObjectChannel(type, id);
      m0.set(id, channel);
      return channel;
    }
    return channel;
  }
}
