import { getJefUser } from '../../utils/get-jef-user';
import {
  ButtonInteraction,
  ForumChannel,
  Message,
  ThreadAutoArchiveDuration,
} from 'discord.js';
import { FAMILY_FEED_CHANNEL_ID, JEF_ID } from '../../../constants';
import client from '../../main';
import { log } from '../../utils';
import { LogType } from '../../types';

export let lastDate = new Date();
export let waitingForFamilyFeed = false;
export const waitingForFriendsFeed = false;
export let waitingForFriendsFeedResponse = false;

export let lastImages = [];
export let lastMessage = '';

const SEND_FRIENDS_FEED_TO_FAMILY_YES = 'send_friends_feed_to_family_yes';
const SEND_FRIENDS_FEED_TO_FAMILY_NO = 'send_friends_feed_to_family_no';

// function waitingForAnything() {
//   return (
//     waitingForFamilyFeed ||
//     waitingForFriendsFeed ||
//     waitingForFriendsFeedResponse
//   );
// }

export async function requestDailyFamilyFeed() {
  // if (waitingForAnything()) return;

  const user = getJefUser();
  if (!user) {
    return;
  }

  const message = {
    content: '# Daily Image Reminder! :house:',
    embeds: [
      {
        description: 'Deze foto word enkel gestuurd naar de **familie**!',
        title: 'Ik verwacht een foto van jou!',
        color: 10233776, // purple
      },
    ],
  };

  await user.send(message);
  waitingForFamilyFeed = true;
}

// export async function requestWeeklyFriendsFeed() {
//   if (waitingForAnything()) return;
//
//   const user = getJefUser();
//   if (!user) {
//     return;
//   }
//
//   const message = {
//     content: '# Weekly Image Reminder! :technologist:',
//     embeds: [
//       {
//         description: 'Deze foto wordt enkel gestuurd naar de **vrienden**!',
//         title: 'Ik verwacht een foto van jou!',
//         color: 5025616, // Green
//       },
//     ],
//   };
//
//   await user.send(message);
//   waitingForFriendsFeed = true;
// }
//
// export async function askSameForFamily() {
//   if (waitingForAnything()) return;
//
//   const user = getJefUser();
//   if (!user) {
//     return;
//   }
//
//   const content = '## And your family? :house:';
//
//   const embeds = [
//     {
//       description: 'Mag ik die **vrienden** foto ook naar de familie sturen?',
//       title: 'Oh, en je familie?',
//       color: 10233776, // purple
//     },
//   ];
//
//   // Create the components.
//   const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
//     new ButtonBuilder()
//       .setCustomId(SEND_FRIENDS_FEED_TO_FAMILY_YES)
//       .setLabel('Ja')
//       .setStyle(ButtonStyle.Success),
//     new ButtonBuilder()
//       .setCustomId(SEND_FRIENDS_FEED_TO_FAMILY_NO)
//       .setLabel('Nee')
//       .setStyle(ButtonStyle.Danger),
//   );
//
//   const message = { content, embeds, components: [components] };
//
//   await user.send(message);
//   waitingForFriendsFeedResponse = true;
// }

export async function onJefButtonInteraction(
  userId: string,
  interaction: ButtonInteraction,
) {
  if (userId !== JEF_ID) return;

  if (
    [SEND_FRIENDS_FEED_TO_FAMILY_YES, SEND_FRIENDS_FEED_TO_FAMILY_NO].includes(
      interaction.customId,
    )
  ) {
    await interaction.deferUpdate();
    await interaction.message.delete();
    waitingForFriendsFeedResponse = false;
  }

  if (interaction.customId == SEND_FRIENDS_FEED_TO_FAMILY_YES) {
    await sendFeed(FAMILY_FEED_CHANNEL_ID, lastMessage, lastImages);
    return;
  }

  if (interaction.customId == SEND_FRIENDS_FEED_TO_FAMILY_NO) {
    await requestDailyFamilyFeed();
    return;
  }
}

export async function onJefImage(userId: string, message: Message) {
  if (userId !== JEF_ID) return;

  const images = message.attachments.map((attachment) => attachment.url);
  if (images.length < 1) return;

  lastImages = images;
  lastMessage = message.content;

  if (waitingForFamilyFeed) {
    waitingForFamilyFeed = false;
    await sendFeed(FAMILY_FEED_CHANNEL_ID, message.content, images);
    return;
  }

  // if (waitingForFriendsFeed) {
  //   waitingForFriendsFeed = false;
  //   await sendFeed(FRIENDS_FEED_CHANNEL_ID, message.content, images);
  //   await askSameForFamily();
  //   return;
  // }
}

export async function sendFeed(
  channelId = FAMILY_FEED_CHANNEL_ID,
  message = 'Another image!',
  attachments = [],
) {
  const messages = message.split('\n') || [message];
  const title = messages.length > 1 ? messages.shift() : message;
  const description = messages.length > 1 ? messages.join('\n') : message;

  const channel = client.channels.cache.get(channelId) as ForumChannel;
  await channel.threads.create({
    name: title || 'Another Image',
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
    message: {
      content: description || 'Another image!',
      files: attachments,
    },
    reason: 'Automated image post.',
  });
}

async function checkFeed() {
  try {
    const date = new Date();
    const timeBetween = date.getTime() - lastDate.getTime();

    // check if its past 23:30 and more than one hour ago
    if (
      date.getHours() == 23 &&
      date.getMinutes() >= 30 &&
      timeBetween > 1000 * 60 * 60
    ) {
      lastDate = date;
      log(LogType.INFO, 'Sending feeds.');
      // if day is saturday
      // if (date.getDay() == 6) {
      //   await requestWeeklyFriendsFeed();
      //   return;
      // }
      await requestDailyFamilyFeed();
    }
  } catch (error) {
    console.error(error);
  }
}

export function startFeeds() {
  lastDate = new Date();
  log(LogType.INFO, 'Feeds started.');
  // check queue every 5 minutes
  setInterval(() => {
    void checkFeed();
  }, 1000 * 60 * 5);
  void checkFeed();
}
