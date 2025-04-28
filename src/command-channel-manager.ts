import { CommandChannel } from "./command-channel.ts";

export class CommandChannelManager {
  private command_channels: Map<string, CommandChannel> = new Map();

  public get_command_channel_by_id(command_uuid: string) {
    const existing = this.command_channels.get(command_uuid);
    if (existing) return existing;
    const channel = new CommandChannel();
    this.command_channels.set(command_uuid, channel);
    return channel;
  }
}
