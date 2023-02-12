import Router from 'express';
import { bot } from '../main.js';
import { BitbucketEventType, CommentWebhook, PullRequestWebhook } from '../types/webhook.type.js';
import { generateEmbed } from '../common/generate-embeds.js';
import * as dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

const webhookRouter = Router();
const WEBHOOK_URL = process.env.BITBUCKET_WEBHOOK_URL;
const AVATAR_URL = process.env.BOT_AVATAR_URL;

webhookRouter.get('/status', (req, res) => {
    return res.json({
        message: 'A-Okay bowass!'
    });
});

webhookRouter.post('/bitbucket', async (req, res) => {
    if (!WEBHOOK_URL) {
        return res.status(400).json({
            error: 'No Bitbucket Webhook configured.',
        });
    }

    const embed = await generateEmbed(req.headers['x-event-key'] as BitbucketEventType, req.body);

    if (!embed) {
        return res.status(400).json({
            message: 'Unsupported event type.',
        });
    }

    const body: any = {
        username: bot.user?.username ?? '',
        avatar_url: AVATAR_URL,
        allowed_mentions: {
            "parse": ["everyone"],
        },
        embeds: [embed]
    };

    axios.post(WEBHOOK_URL, body, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        console.log(`[Bitbucket webhook event] [${embed.title}]`);
    }).catch(err => {
        console.log(`Webhook request failed with the following error:`);
        console.error(err);
    });

    res.json({
        message: 'Success',
    });
});

export default webhookRouter;