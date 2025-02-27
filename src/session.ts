import { Socket } from "engine.io";

export class Session {
  private session_id: string;
  constructor(session_id: string) {
    this.session_id = session_id;
  }

  public set_connection(conn: Socket) {
    console.error(`todo set connection`);
  }
}
