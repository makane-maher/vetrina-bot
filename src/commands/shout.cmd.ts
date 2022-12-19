import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { SecretsService } from "../services/secrets.service.js";

@Discord()
export class Shout {

    @Slash({
        description: 'Shout something very loud',
    })
    async shout(
        @SlashOption({
            name: 'message',
            description: 'What do you want me to shout?',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        message: string,
        @SlashOption({
            name: 'key',
            description: 'the secrets key you\'re looking for',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        key: string,
        interaction: CommandInteraction
    ) {
        const embed = new EmbedBuilder({
            author: {
                name: interaction.user.tag,
                icon_url: interaction.user.avatarURL({ forceStatic: true })!
            },
            title: 'Shouting',
            description: message.toUpperCase(),
            timestamp: Date.now(),
            color: Colors.DarkRed,
        });

        const secretsService = new SecretsService();
        const value = secretsService.getSecretByKey(key);

        if (value) {
            embed.addFields([
                { name: key, value: value ? `||${value}||` : 'N/A' }
            ]);
        }

        await interaction.reply({ embeds: [embed] });

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 5e3);
    }
}