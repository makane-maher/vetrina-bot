import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Guard, Guild, Slash, SlashOption } from "discordx";
import { constants } from "../common/constants.js";
import { memberGuard } from "../guards/member.guard.js";

@Discord()
export class Announcement {
    constructor() { }

    @Slash({
        name: 'announcement',
        description: 'Make an announcement in the #announcement channel for you.',
    })
    @Guard(memberGuard)
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
        interaction: CommandInteraction,
        client: Client,
        guardData: { go: boolean, message?: string },
    ) {
        const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL;

        if (!announcementChannelId) {
            return await interaction.followUp({ content: 'No announcement channel ID set in `.env`.' });
        }

        if (!guardData.go) {
            try {
                await interaction.followUp({ content: guardData.message });
            } catch (e) {
                await interaction.followUp({ content: 'Looks like you don\'t have permission, boss.' });
            }
            return;
        }

        const channel = interaction.guild?.channels.cache.find((channel) => channel.id === announcementChannelId);

        if (!channel?.isTextBased()) {
            await interaction.followUp({ content: 'Couldn\'t find the announcement channel man..' });
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
                text: `By ${interaction.user.username}`,
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