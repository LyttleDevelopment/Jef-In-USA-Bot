import { actionPrefix } from './index';
import { Client } from 'discord.js';
import { executor } from '../../utils';
import { startFeeds } from '../../modules/Feeds/request-feed';

// This file's prefix
const prefix: string = actionPrefix + 'onClientReady.';

// The execute function
export async function onClientReady(client: Client): Promise<void> {
  // All actions that should be executed
  const actions: Promise<() => void>[] = [executor(startFeeds)];

  // If no actions, return
  if (actions.length < 1) return;

  // Execute all actions
  await Promise.all(actions);
}
