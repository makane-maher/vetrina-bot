import Router from 'express';
import { bot } from '../main.js';
import { CommentWebhook, PullRequestWebhook } from '../types/webhook.type.js';
import { generateEmbed } from '../common/generate-embeds.js';
import * as dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

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

webhookRouter.get('/status', (req, res) => {
    return res.json({
        message: 'A-Okay bowass!'
    });
});

webhookRouter.post('/bitbucket', (req, res) => {
    if (!WEBHOOK_URL) {
        return res.status(400).json({
            error: 'No Bitbucket Webhook configured.',
        });
    }

    const data = parseWebhook(req.body);

    if (!data) {
        return res.status(400).json({
            error: 'Bad data',
        });
    }

    const embed = generateEmbed(data);

    const body: any = {
        username: bot.user?.username ?? '',
        embeds: [embed]
    };

    axios.post(WEBHOOK_URL, body, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        let data;
        try {
            data = response.data;
        } catch (e) {
            data = response.status;
        }
        console.log(`Reponse from Discord:`);
        console.log(data);
    });

    res.json({
        message: 'Success',
    });
});

export default webhookRouter;