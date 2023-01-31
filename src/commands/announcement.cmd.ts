import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Slash, SlashOption } from "discordx";
import { constants } from "../common/constants";

@Discord()
export class Announcement {
    constructor() { }

    @Slash({
        name: 'announcement',
        description: 'Make an announcement in the #announcement channel for you.',
    })
    async announce(
        @SlashOption({
            name: 'title',
            description: 'Title of the announcement',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        title: string,
        @SlashOption({
            name: 'message',
            description: 'The announcement message to blast',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        message: string,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply();

        const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL;

        if (!announcementChannelId) {
            return await interaction.followUp({ content: 'No announcement channel ID set in `.env`.' });
        }

        const channel = interaction.guild?.channels.cache.find((channel) => channel.id === announcementChannelId);

        if (!channel?.isTextBased()) {
            await interaction.followUp({ content: 'Looks like I have the wrong channel ID in my `.env`.' });
            return;
        }

        const embed = new EmbedBuilder({
            color: constants.VETRINA_COLOR,
            title: title,
            description: message,
            timestamp: new Date(),
            image: {
                url: constants.ANNOUNCEMENT_BANNER_IMAGE_URL,
            },
            footer: {
                text: `By ${interaction.user.toString()}`,
            },
        });

        await channel.send({ embeds: [embed] });

        const successMessage = await interaction.followUp({ content: 'Sent successfully!' });
        const thanksMessage = await interaction.followUp({ content: 'Thank you for using Vetrina Bot Services (VBS).' });

        setTimeout(async () => {
            await successMessage.delete();
            await thanksMessage.delete();
        }, 5e3);
    }
}