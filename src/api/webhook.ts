import Router from 'express';
import { bot } from '../main.js';
import { CommentWebhook, PullRequestWebhook } from '../types/webhook.type.js';
import { generateEmbed } from '../common/generate-embeds.js';

const webhookRouter = Router();
const WEBHOOK_URL = process.env.BITBUCKET_WEBHOOK_URL;

function parseWebhook(body: any) {
    if (body.comment) {
        return body as CommentWebhook;
    }
    if (body.pullrequest) {
        return body as PullRequestWebhook;
    }
    return null;
}

webhookRouter.post('/bitbucket', (req, res) => {
    if (!WEBHOOK_URL) {
        return;
    }

    const data = parseWebhook(req.body);

    if (!data) {
        return res.json();
    }

    const embed = generateEmbed(data);

    const body: any = {
        username: bot.user?.username ?? '',
        embeds: [embed]
    };

    fetch(WEBHOOK_URL, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
    }).then(async (response) => {
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = response.status;
        }
        console.log(`Reponse from Bitbucket:`);
        console.log(data);
    });
    res.json();
});

export default webhookRouter;