export type command_status = {
  command_uuid: string;
  status_t: number;
  type: "queued" | "succeeded" | "failed" | "aborted";
};
