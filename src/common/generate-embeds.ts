import { EmbedData } from "discord.js";
import e from "express";
import { CommentWebhook, PullRequestStatus, PullRequestWebhook } from "../types/webhook.type.js";

export function generateEmbed(data: CommentWebhook | PullRequestWebhook): EmbedData {

    const embed: EmbedData = {
        description: `**${data.pullrequest.title}**`,
        url: data.pullrequest.links.html.href,
        author: {
            name: data.actor.display_name,
        },
        thumbnail: {
            url: data.actor.links.avatar.href,
        }
    };

    embed.fields = [];

    if ('comment' in data) {
        addCommentFields(embed, data);
    } else {
        addPRFields(embed, data);
    }
    
    return embed;
}

function addCommentFields(embed: EmbedData, data: CommentWebhook) {
    embed.title = `[${data.repository.full_name}] ${data.comment.user.display_name} ${data.comment.parent ? 'replied to a comment' : 'commented'} on PR #${data.pullrequest.id}`;
    embed.author = {
        name: data.comment.user.display_name,
    };
    embed.fields!.push({ name: `${data.comment.user.display_name}:`, value: data.comment.content.raw! });
}

function addPRFields(embed: EmbedData, data: PullRequestWebhook) {
    embed.title = `[${data.repository.full_name}] ${data.actor.display_name} created a new PR #${data.pullrequest.id}`;
        
    if (data.pullrequest.state === PullRequestStatus.MERGED) {
        embed.title = `[${data.repository.full_name}] ${data.actor.display_name} merged PR #${data.pullrequest.id}`;
    } else if (data.pullrequest.state === PullRequestStatus.DECLINED) {
        embed.title = `[${data.repository.full_name}] ${data.actor.display_name} declined PR #${data.pullrequest.id}`;
    }

    if (data.approval) {
        embed.title = `[${data.repository.full_name}] ${data.approval.user.display_name} approved PR #${data.pullrequest.id}`;
        embed.author = {
            name: data.approval.user.display_name,
        };
        embed.fields!.push({ name: 'Approvals', value: `Approved by ${data.approval.user.display_name}` });
    }

    embed.fields?.push(
        { name: 'Source Branch', value: data.pullrequest.source.branch.name },
        { name: 'Destination Branch', value: data.pullrequest.destination.branch.name },
        { name: 'State', value: data.pullrequest.state },
    );
}