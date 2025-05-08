import { Socket } from "engine.io";
import assert from "node:assert";
import { type command_status } from "./command-status.ts";

type credentials = { user_id: string; password: string };

type message =
  | { type: "session"; is_new: boolean }
  | {
      type: "command_status";
      command_uuid: string;
      status: command_status["type"];
    }
  | {
      type: "rev";
      rev: { t: number; i: number; type: string; id: string; data: any };
    }
  | { type: "auth"; user_id: string }
  | { type: "auth_error" }
  | { type: "syn"; i: number };

export class Session {
  private session_id: string;
  private connection: Socket | undefined = undefined;
  private closed: number | undefined;
  private message_queue: message[] = [];
  private sent_messages: message[] = [];
  private syn: number = 0;
  private credentials: credentials | undefined;

  constructor(session_id: string) {
    this.session_id = session_id;
  }

  private send(message: message) {
    if (this.message_queue.length === 0) {
      setTimeout(() => this.flush_queue(), 0);
    }
    this.message_queue.push(message);
  }

  public notify_command_status(status: command_status) {
    this.send({
      type: "command_status",
      command_uuid: status.command_uuid,
      status: status.type,
    });
  }

  public notify_object_status(
    type: string,
    id: string,
    t: number,
    i: number,
    data: any
  ) {
    this.send({
      type: "rev",
      rev: { type, id, t, i, data },
    });
  }

  private flush_queue() {
    if (this.closed || this.message_queue.length === 0) return;
    this.message_queue.push({ type: "syn", i: this.syn });
    this.syn += 1;
    assert(this.connection);
    this.connection.send(JSON.stringify(this.message_queue));
    this.sent_messages = [...this.sent_messages, ...this.message_queue];
    this.message_queue = [];
  }

  public set_connection(connection: Socket) {
    const old_connection = this.connection;
    this.connection = connection;
    this.closed = undefined;
    if (this.sent_messages.length > 0) {
      connection.send(JSON.stringify(this.sent_messages));
    }
    this.send({ type: "session", is_new: !old_connection });
  }

  public connection_closed(now: number) {
    assert(this.connection);
    assert(this.closed === undefined);
    this.closed = now;
  }

  public ack_received(i: number) {
    const idx = this.sent_messages.findIndex(
      (x) => x.type === "syn" && x.i === i
    );
    assert(idx !== -1);
    this.sent_messages.splice(0, idx + 1);
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

  public set_credentials(credentials: credentials) {
    this.credentials = credentials;
    this.send({ type: "auth", user_id: credentials.user_id });
  }

  public auth_error() {
    this.credentials = undefined;
    this.send({ type: "auth_error" });
  }
}
