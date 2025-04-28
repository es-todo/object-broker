import { type command_status } from "./command-status.ts";
import { Session } from "./session.ts";

export class CommandChannel {
  private sessions: Set<Session> = new Set();

  add_subscriber(session: Session) {
    this.sessions.add(session);
  }

  update_status(data: command_status) {
    this.sessions.forEach((session) => session.notify_command_status(data));
    console.log(data);
  }
}
