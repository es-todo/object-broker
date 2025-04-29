import axios from "axios";
import { forever } from "./forever.ts";

type subscriber = (t: number, i: number, data: any) => void;

type object_result =
  | {
      found: false;
    }
  | {
      found: true;
      t: number;
      i: number;
      data: any;
    };

async function get_object(type: string, id: string): Promise<object_result> {
  return forever(async () => {
    const tstr = encodeURIComponent(type);
    const idstr = encodeURIComponent(id);
    const res = await axios.get(
      `http://object-reducer:3000/object-apis/get-object?type=${tstr}&id=${idstr}`
    );
    return res.data as object_result;
  });
}

export class ObjectChannel {
  private subscribers: Set<subscriber> = new Set();
  private state: { t: number; i: number; data: any } | undefined = undefined;
  private type: string;
  private id: string;

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
  }

  public notify_change(t: number, i: number, data: any) {
    if (
      this.state &&
      (this.state.t > t || (this.state.t === t && this.state.i > i))
    ) {
      return;
    }
    this.state = { t, i, data };
    for (const s of this.subscribers) {
      s(t, i, data);
    }
  }

  public subscribe(subscriber: subscriber): () => void {
    if (this.state) {
      subscriber(this.state.t, this.state.i, this.state.data);
    }
    if (this.subscribers.size === 0) {
      this.refresh(); // note that calling subscribe twice only triggers this once
    }
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
      if (this.subscribers.size === 0) {
        // TODO: maybe gc this channel
      }
    };
  }

  private async refresh() {
    const res = await get_object(this.type, this.id);
    if (res.found) {
      this.notify_change(res.t, res.i, res.data);
    } else {
      this.notify_change(0, 0, null);
    }
  }
}
