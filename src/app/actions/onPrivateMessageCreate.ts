import { Message } from 'discord.js';
import { onJefImage } from '../../modules/Feeds/request-feed';
import { executor } from '../../utils';

// The execute function
export async function onPrivateMessageCreate(
  userId: string,
  message: Message,
): Promise<void> {
  // All actions that should be executed
  const actions: Promise<() => void>[] = [
    executor(onJefImage, userId, message),
  ];

  // If no actions, return
  if (actions.length < 1) return;

  // Execute all actions
  await Promise.all(actions);
}
