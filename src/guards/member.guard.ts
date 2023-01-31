import { ArgsOf, GuardFunction } from "discordx";

export const memberGuard: GuardFunction<ArgsOf<"interactionCreate">> = async ([message], client, next, guardData) => {
    if (message.user.id != process.env.PHILIP) {
        guardData.go = false;
        guardData.message = '[**403**] Permission __**DENIED**__';
    } else {
        guardData.go = true;
    }
    await next();
};