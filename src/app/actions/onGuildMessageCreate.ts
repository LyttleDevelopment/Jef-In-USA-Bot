import { GuildMember } from '../../types';
import { actionPrefix } from './index';
import { Message } from 'discord.js';

const prefix: string = actionPrefix + 'onGuildMessageCreate.';

export async function onGuildMessageCreate(
  guildMember: GuildMember,
  message: Message,
): Promise<void> {
  // All actions that should be executed
  const actions: Promise<() => void>[] = [];

  // If no actions, return
  if (actions.length < 1) return;

  // Execute all actions
  await Promise.all(actions);
}
