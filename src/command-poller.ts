import axios from "axios";
import assert from "node:assert";
import { CommandChannelManager } from "./command-channel-manager.ts";
import { type command_status } from "./command-status.ts";
import { forever } from "./forever.ts";

async function fetch_status_t(): Promise<number> {
  return forever(async () => {
    const x = await axios.get("http://event-db:3000/event-apis/status-t");
    assert(typeof x.data === "number");
    return x.data;
  });
}

async function poll_queue_t(status_t: number): Promise<command_status> {
  return forever(async () => {
    const res = await axios.get(
      `http://event-db:3000/event-apis/poll-status?status_t=${status_t}`
    );
    return res.data as command_status;
  });
}

export async function init_command_poller(
  command_channel_manager: CommandChannelManager
) {
  let status_t = await fetch_status_t();
  while (true) {
    const data = await poll_queue_t(status_t + 1);
    const command_channel = command_channel_manager.get_command_channel_by_id(
      data.command_uuid
    );
    command_channel.update_status(data);
    status_t += 1;
  }
}
