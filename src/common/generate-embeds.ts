import { AttachmentBuilder, Colors, EmbedData } from "discord.js";
import { CommentWebhook, PullRequestStatus, PullRequestWebhook } from "../types/webhook.type.js";

export function generateEmbed(data: CommentWebhook | PullRequestWebhook) {

    const embed: EmbedData = {
        description: `Title: **${data.pullrequest.title}**`,
        url: data.pullrequest.links.html.href,
        color: 477094,
        timestamp: new Date().toISOString(),
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
    embed.title = `${data.comment.user.display_name} ${data.comment.parent ? 'replied to a comment' : 'commented'} on PR #${data.pullrequest.id}`;
    embed.fields!.push({
        name: `${data.comment.user.display_name}:`,
        value: data.comment.content.raw!.length > 1000 ? data.comment.content.raw!.slice(0,1000) + '...' : data.comment.content.raw!,
    });
    embed.thumbnail = {
        url: 'https://www.shadetreeauto.biz/wp-content/uploads/2019/04/comment.png'
    };
}

function addPRFields(embed: EmbedData, data: PullRequestWebhook) {
    embed.title = `${data.actor.display_name} created a new PR #${data.pullrequest.id}`;
    embed.color = Colors.White;
    embed.thumbnail = {
        url: 'https://cdn1.iconfinder.com/data/icons/e-commerce-set-4/256/New-512.png',
    };

    if (data.pullrequest.state === PullRequestStatus.MERGED) {
        embed.title = `${data.actor.display_name} merged PR #${data.pullrequest.id}`;
        embed.color = Colors.DarkGreen;
        embed.thumbnail = {
            url: 'https://cdn.shopify.com/s/files/1/0107/4751/0884/products/Confetti3_250x250@2x.gif?v=1574208137',
        };
    } else if (data.pullrequest.state === PullRequestStatus.DECLINED) {
        embed.title = `${data.actor.display_name} declined PR #${data.pullrequest.id}`;
        embed.color = Colors.DarkRed;
        embed.thumbnail = {
            url: 'http://www.clipartbest.com/cliparts/MiL/Lpy/MiLLpypAT.png',
        };
    }
    
    if (data.approval) {
        embed.title = `${data.approval.user.display_name} approved PR #${data.pullrequest.id}`;
        embed.fields!.push({
            name: 'Approvals',
            value: `Approved by ${data.approval.user.display_name}`,
        });
        embed.color = Colors.Green;
        embed.thumbnail = {
            url: 'https://cdn.pixabay.com/photo/2012/04/11/17/44/check-mark-29114_960_720.png',
        };
    }

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