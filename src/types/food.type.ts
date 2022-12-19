import { User } from "discord.js";

export class Order {
    createdAt: EpochTimeStamp;

    constructor (
        public name: string,
        public entries: Entry[] = [],
        public createdBy: User,
    ) {
        this.createdAt = Math.floor(Date.now() / 1000);
    }

    addOrderEntry(item: string, user: User) {
        const exists = this.entries.find(entry => entry.user.id === user.id);

        if (!exists) {
            const entry = new Entry(user, [item]);
            this.entries.push(entry);
            return;
        }

        exists.addItem(item);
    }
}

export class Entry {
    constructor(
        public user: User,
        public items: string[] = [],
    ) {}

    addItem(item: string) {
        this.items.push(item);
    }
}
