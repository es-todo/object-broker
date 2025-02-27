import { Socket } from "engine.io";
import assert from "node:assert";

type message = { type: "session"; is_new: boolean };

export class Session {
  private session_id: string;
  private connection: Socket | undefined = undefined;
  private closed: number | undefined;

  constructor(session_id: string) {
    this.session_id = session_id;
  }

  private send(message: message) {
    console.log(message);
    console.log("todo sending");
  }

  public set_connection(connection: Socket) {
    const old_connection = this.connection;
    this.connection = connection;
    this.closed = undefined;
    this.send({ type: "session", is_new: !old_connection });
  }

  public connection_closed(now: number) {
    assert(this.connection);
    assert(this.closed === undefined);
    this.closed = now;
  }

  public closed_time() {
    return this.closed;
  }

  public get_session_id() {
    return this.session_id;
  }

  public terminate() {
    console.log(`todo: terminate`);
  }
}
