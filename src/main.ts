import * as engine from "engine.io";
import assert from "node:assert";
import { Session } from "./session.ts";
import { CommandChannel } from "./command-channel.ts";
import { issue_command } from "./issue-command.ts";

const server = engine.listen(3000, {}, () => {
  console.log("engine listening on 3000");
});

const session_cache: Map<string, Session> = new Map();

const command_channels: Map<string, CommandChannel> = new Map();

const get_command_channel_by_id = (command_uuid: string) => {
  const existing = command_channels.get(command_uuid);
  if (existing) return existing;
  const channel = new CommandChannel();
  command_channels.set(command_uuid, channel);
  return channel;
};

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
        case "ack": {
          const { i } = message;
          assert(typeof i === "number");
          assert(session !== undefined);
          session.ack_received(i);
          return;
        }
        case "session": {
          const { session_id } = message;
          assert(typeof session_id === "string");
          //assert(session === undefined);
          session = session_cache.get(session_id);
          if (session) {
            session.set_connection(conn);
          } else {
            session = new Session(session_id);
            session_cache.set(session_id, session);
            session.set_connection(conn);
          }
          return;
        }
        case "command": {
          const { command_uuid, command_type, command_data } = message;
          assert(typeof command_uuid === "string");
          assert(typeof command_type === "string");
          assert(session !== undefined);
          const command_channel = get_command_channel_by_id(command_uuid);
          command_channel.add_subscriber(session);
          issue_command({ command_uuid, command_type, command_data });
          return;
        }
        default:
          throw new Error(`unknown message type: ${message.type}`);
      }
    });
  });
  conn.on("close", () => {
    console.log(`connection closed`);
    if (session) {
      const now = Date.now();
      session.connection_closed(now);
      setTimeout(() => {
        assert(session);
        const closed = session.closed_time();
        if (closed === now) {
          session_cache.delete(session.get_session_id());
          session.terminate();
        }
      }, 10 * 60 * 1000);
    }
  });
});
