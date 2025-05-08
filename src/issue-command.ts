import axios from "axios";
import { sleep } from "./sleep.ts";

type command_auth =
  | { authenticated: false }
  | { authenticated: true; user_id: string; signature: string };

type command_payload = {
  command_uuid: string;
  command_type: string;
  command_data: any;
  command_auth: command_auth;
};

export async function issue_command(payload: command_payload) {
  console.log({ payload });
  while (true) {
    const result = await axios.post(
      "http://event-db:3000/event-apis/submit-command",
      payload,
      {
        validateStatus: () => true,
      }
    );
    if (result.status >= 200 && result.status < 300) {
      console.log(`command ok: ${result.status}: ${result.statusText}`);
      return;
    } else {
      console.error(`command error: ${result.status}: ${result.statusText}`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}
