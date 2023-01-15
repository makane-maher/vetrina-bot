import { EmojiIdentifierResolvable, Message } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";

enum TriggerActionType {
  MESSAGE,
  REACTION,
};

type Action = {
  trigger: string[];
  type: TriggerActionType;
  value: string;
};

const allActions: Action[] = [
  {
    trigger: ['vetrina'],
    type: TriggerActionType.REACTION,
    value: '🔥',
  },
  {
    trigger: ['messi'],
    type: TriggerActionType.REACTION,
    value: '🐐',
  },
  {
    trigger: ['bravo', 'congratulations', 'mabrook'],
    type: TriggerActionType.REACTION,
    value: '🎉',
  },
];

@Discord()
export class MessageListener {
  @On({ event:  'messageCreate' })
  messageCreate([message]: ArgsOf<'messageCreate'>, client: Client): void {
    const actions = this._matchTrigger(message.content);
    
    if (actions.length === 0) {
      return;
    }

    this._dispatchAction(message, actions);
  }
  
  private _matchTrigger(message: string): Action[] {
    const arrayOfWords = message.trim().replace(/[^a-zA-Z ]/g, " ").split(' ').map(value => value.toLowerCase());
    return allActions.filter(action => action.trigger.some(x => arrayOfWords.includes(x)));
  }

  private async _dispatchAction(message: Message, actions: Action[]) {
    for (const action of actions) {
      if (action.type === TriggerActionType.MESSAGE) {
        await message.reply({ content: action.value });
      }
  
      if (action.type === TriggerActionType.REACTION) {
        await message.react(action.value);
      }
    }
  }
}
