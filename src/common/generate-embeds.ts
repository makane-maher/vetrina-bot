import { Colors, EmbedData } from 'discord.js';
import data from '../assets/users.json' assert { type: 'json' };
import {
  BitbucketEventType,
  CommentWebhook,
  PullRequestWebhook,
} from '../types/webhook.type.js';
import { constants } from './constants.js';

type BitbucketEvent = PullRequestWebhook | CommentWebhook;
type User = {
  bitbucketId: string;
  discordId: string;
  name: string;
};

const users: User[] = data;

export async function generateEmbed(
  eventType: BitbucketEventType,
  data: BitbucketEvent,
) {
  const embed: EmbedData = {
    title: `[${data.pullrequest?.id}] ${data.pullrequest?.title}`,
    color: 477094,
    timestamp: new Date().toISOString(),
    url: data.pullrequest?.links.html.href,
    fields: [],
  };

  switch (eventType) {
    case BitbucketEventType.COMMENT_NEW:
      embed.description = `${_findUserByName(
        (data as CommentWebhook).comment.user.display_name,
      )} ${
        (data as CommentWebhook).comment.parent
          ? 'replied to a comment'
          : 'commented'
      } on PR #${data.pullrequest.id}`;
      embed.url = (data as CommentWebhook).comment.links.html.href;
      embed.thumbnail = {
        url: constants.icons.COMMENT,
      };
      addCommentFields(embed, data as CommentWebhook);
      break;

    case BitbucketEventType.PR_APPROVED:
      embed.description = `${_findUserByName(
        data.actor.display_name,
      )} approved PR #${data.pullrequest.id}`;
      embed.color = Colors.Green;
      embed.thumbnail = {
        url: constants.icons.APPROVED,
      };
      break;

    case BitbucketEventType.PR_CHANGE_REQUEST:
      embed.description = `${_findUserByName(
        data.actor.display_name,
      )} requested changes on PR #${data.pullrequest.id}`;
      embed.color = Colors.Orange;
      embed.thumbnail = {
        url: constants.icons.CHANGE,
      };
      break;

    case BitbucketEventType.PR_DECLINED:
      embed.description = `${_findUserByName(
        data.actor.display_name,
      )} declined PR #${data.pullrequest.id}`;
      embed.fields!.push({
        name: `Reason`,
        value: data.pullrequest.reason ?? '-',
      });
      embed.color = Colors.DarkRed;
      embed.thumbnail = {
        url: constants.icons.DECLINED,
      };
      break;

    case BitbucketEventType.PR_MERGED:
      embed.description = `${_findUserByName(
        data.actor.display_name,
      )} merged PR #${data.pullrequest.id} (${
        data.pullrequest.source.branch.name
      } → ${data.pullrequest.destination.branch.name})`;
      embed.color = Colors.DarkGreen;
      embed.thumbnail = {
        url: constants.icons.MERGED,
      };
      break;

    case BitbucketEventType.PR_NEW:
      embed.description = `${_findUserByName(
        data.actor.display_name,
      )} created a new PR #${data.pullrequest.id}`;
      embed.color = Colors.White;
      embed.thumbnail = {
        url: constants.icons.NEW,
      };
      if (data.pullrequest.description) {
        embed.fields!.push({
          name: 'Description',
          value: data.pullrequest.description,
        });
      }
      break;
    default:
      return null;
  }

  return embed;
}

function addCommentFields(embed: EmbedData, data: CommentWebhook) {
  const matches = [
    ...(data.comment.content.raw?.matchAll(/@\{(?<user>\w+)\}/g) ?? []),
  ];

  const ids = [];
  for (const mention of matches) {
    ids.push({
      replace: mention[1],
      with: (users as User[]).find(u => u.bitbucketId === mention[1]),
    });
  }

  let message = data.comment.content.raw ?? '';
  for (const id of ids) {
    message = message?.replaceAll(
      `@{${id.replace}}`,
      `<@${id.with?.discordId ?? id.replace}>`,
    );
  }
  embed.fields?.push({
    name: `${_findUserByName(data.comment.user.display_name)}`,
    value: message?.length > 1000 ? message.slice(0, 1000) + '...' : message,
  });
}

function _findUserByName(name: string) {
  const found = users.find(
    user =>
      user.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(user.name.toLowerCase()),
  );
  if (!found) {
    return name;
  }
  return `<@${found.discordId}>`;
}
