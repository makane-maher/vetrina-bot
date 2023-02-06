import { AttachmentBuilder, Colors, EmbedData } from "discord.js";
import { BitbucketEventType, CommentWebhook, PullRequestStatus, PullRequestWebhook } from "../types/webhook.type.js";
import { constants } from "./constants.js";
import axios from "axios";

type BitbucketEvent = PullRequestWebhook | CommentWebhook;

export async function generateEmbed(eventType: BitbucketEventType, data: BitbucketEvent) {

    const embed: EmbedData = {
        color: 477094,
        timestamp: new Date().toISOString(),
        fields: [],
    };

    switch(eventType) {
        case BitbucketEventType.COMMENT_NEW:
            embed.title = `${(data as CommentWebhook).comment.user.display_name} ${(data as CommentWebhook).comment.parent ? 'replied to a comment' : 'commented'} on PR #${data.pullrequest.id}`;
            embed.url = (data as CommentWebhook).comment.links.html.href;
            embed.thumbnail = {
                url: constants.icons.COMMENT,
            };
            break;

        case BitbucketEventType.PR_APPROVED:
            embed.title = `${data.actor.display_name} approved PR #${data.pullrequest.id}`;
            embed.color = Colors.Green;
            embed.thumbnail = {
                url: constants.icons.APPROVED,
            };
            break;

        case BitbucketEventType.PR_CHANGE_REQUEST:
            embed.title = `${data.actor.display_name} requested changes on PR #${data.pullrequest.id}`;
            embed.color = Colors.Orange;
            embed.thumbnail = {
                url: constants.icons.CHANGE,
            };
            break;

        case BitbucketEventType.PR_DECLINED:
            embed.title = `${data.actor.display_name} declined PR #${data.pullrequest.id}`;
            embed.color = Colors.DarkRed;
            embed.thumbnail = {
                url: constants.icons.DECLINED,
            };
            break;

        case BitbucketEventType.PR_MERGED:
            embed.title = `${data.actor.display_name} merged PR #${data.pullrequest.id}`;
            embed.color = Colors.DarkGreen;
            embed.thumbnail = {
                url: constants.icons.MERGED,
            };
            break;

        case BitbucketEventType.PR_NEW:
            embed.title = `${data.actor.display_name} created a new PR #${data.pullrequest.id}`;
            embed.color = Colors.White;
            embed.thumbnail = {
                url: constants.icons.NEW,
            };
            break;
        default:
            return null;
    }

    embed.url = embed.url ?? data.pullrequest.links.html.href;

    if (eventType === BitbucketEventType.COMMENT_NEW) {
        await addCommentFields(embed, data as CommentWebhook);
    } else {
        addPRFields(embed, data);
    }
    
    return embed;
}

async function addCommentFields(embed: EmbedData, data: CommentWebhook) {
    const matches = [...(data.comment.content.raw?.matchAll(/@\{(?<user>\w+)\}/g) ?? [])];

    const ids = [];
    for (const user of matches) {
        ids.push({
            replace: user[1],
            with: null,
        });
    }

    const result = await Promise.allSettled(ids.map(id => axios.get(`https://api.bitbucket.org/2.0/users/${id.replace}`)));

    for (let i = 0; i < result.length; i++) {
        const found = result[i];
        if (found.status === 'fulfilled') {
            var user = await found.value.data;
            ids[i].with = user?.display_name;
        }
    }

    let message = data.comment.content.raw ?? '';

    for (const id of ids) {
        message = message?.replaceAll(`@{${id.replace}}`, `**@${id.with ?? id.replace}**`);
    }

    embed.fields!.push({
        name: `${data.comment.user.display_name}:`,
        value: message?.length > 1000 ? message.slice(0,1000) + '...' : message,
    });
    
}

function addPRFields(embed: EmbedData, data: PullRequestWebhook) {
    embed.fields?.push(
        {
            name: 'Source Branch',
            value: data.pullrequest.source.branch.name,
        },
        {
            name: 'Destination Branch',
            value: data.pullrequest.destination.branch.name,
        },
        {
            name: 'State',
            value: data.pullrequest.state,
        },
    );
}