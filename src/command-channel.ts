import { Session } from "./session.ts";

export class CommandChannel {
  private sessions: Set<Session> = new Set();

  add_subscriber(session: Session) {
    this.sessions.add(session);
  }
}
