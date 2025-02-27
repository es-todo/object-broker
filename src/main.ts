import * as engine from "engine.io";
import assert from "node:assert";
import { Session } from "./session.ts";

const server = engine.listen(3000, {}, () => {
  console.log("engine listening on 3000");
});

const session_cache: Map<string, Session> = new Map();

server.on("connection", (conn: engine.Socket) => {
  console.log(`connection!`);
  let session: Session | undefined = undefined;
  conn.on("message", (x) => {
    assert(typeof x === "string");
    const messages = JSON.parse(x);
    assert(Array.isArray(messages));
    messages.forEach((message) => {
      console.log(message);
      assert(typeof message === "object");
      switch (message.type) {
        case "syn": {
          const { i } = message;
          assert(typeof i === "number");
          conn.send(JSON.stringify([{ type: "ack", i }]));
          return;
        }
        case "session": {
          const { session_id } = message;
          assert(typeof session_id === "string");
          const session = session_cache.get(session_id);
          if (session) {
            session.set_connection(conn);
          } else {
            const session = new Session(session_id);
            session_cache.set(session_id, session);
            session.set_connection(conn);
          }
          return;
        }
        default:
          throw new Error(`unknown message type: ${message.type}`);
      }
    });
  });
});
