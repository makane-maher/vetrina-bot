import { CommandInteraction } from 'discord.js';
import { GuardFunction } from 'discordx';

export const memberGuard: GuardFunction<CommandInteraction> = async (
  interaction,
  client,
  next,
  guardData,
) => {
  await interaction.deferReply();

  if (interaction.user.id != process.env.PHILIP) {
    guardData.go = false;
    guardData.message = '[**403**] Permission __**DENIED**__';
  } else {
    guardData.go = true;
  }
  await next();
};
