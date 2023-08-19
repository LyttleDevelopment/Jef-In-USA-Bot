import { actionPrefix } from './index';
import { ButtonInteraction } from 'discord.js';
import { onJefButtonInteraction } from '../../modules/Feeds/request-feed';
import { executor } from '../../utils';

// This file's prefix
const prefix: string = actionPrefix + 'onPrivateInteractionButton.';

// The execute function
export async function onPrivateInteractionButton(
  userId: string,
  interaction: ButtonInteraction,
): Promise<void> {
  // All actions that should be executed
  const actions: Promise<() => void>[] = [
    executor(onJefButtonInteraction, userId, interaction),
  ];

  // If no actions, return
  if (actions.length < 1) return;

  // Execute all actions
  await Promise.all(actions);
}
