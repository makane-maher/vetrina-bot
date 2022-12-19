import { EmojiIdentifierResolvable, Message } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";

enum TriggerActionType {
  MESSAGE,
  REACTION,
};

type Action = {
  action: TriggerActionType;
  value: string;
};

const triggers: {[key: string]: Action} = {
  vetrina: {
    action: TriggerActionType.REACTION,
    value: '🔥',
  },
  messi: {
    action: TriggerActionType.REACTION,
    value: '🐐'
  },
};

@Discord()
export class Example {
  @On()
  messageDelete([message]: ArgsOf<"messageDelete">, client: Client): void {
    console.log("Message Deleted", client.user?.username, message.content);
  }
}

@Discord()
export class MessageListener {
  @On({ event:  'messageCreate' })
  messageCreate([message]: ArgsOf<'messageCreate'>, client: Client): void {
    const action = this._matchTrigger(message.content);
    
    if (!action) {
      return;
    }

    this._dispatchAction(message, action);
  }
  
  private _matchTrigger(message: string): Action | null {
    const arrayOfWords = message.trim().split(' ').map(value => value.toLowerCase());
    const triggerStrings = Object.keys(triggers);
    let action = null;    
  
    for (let word of arrayOfWords) {
      const trigger = triggerStrings.find(value => word.match(value))
      if (trigger) {
        action = triggers[trigger];
        break;
      }
    }

    return action;
  }

  private async _dispatchAction(message: Message, action: Action) {
    if (action.action === TriggerActionType.MESSAGE) {
      return await message.reply({ content: action.value });
    }

    if (action.action === TriggerActionType.REACTION) {
      return await message.react(action.value);
    }
  }
}
