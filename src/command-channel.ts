import { type command_status } from "./command-status.ts";

type subscriber = (status: command_status) => void;

export class CommandChannel {
  private subscribers: Set<subscriber> = new Set();

  add_subscriber(f: subscriber) {
    this.subscribers.add(f);
  }

  update_status(data: command_status) {
    this.subscribers.forEach((f) => f(data));
    console.log(data);
  }
}
