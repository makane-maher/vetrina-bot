import { Colors, EmbedBuilder, User } from "discord.js";
import { singleton } from "tsyringe";
import { Order } from "../types/food.type.js";

@singleton()
export class FoodService {
    orders: Order[] = [];

    createOrder(name: string, user: User): Order {
        const order: Order = new Order(
            name,
            [],
            user,
        );
        this.orders.push(order);
        return order;
    }

    getOrder(name: string) {
        return this.orders.find(order => order.name === name);
    }

    removeItem() {

    }

    createOrderEmbed(name: string) {
        const order = this.getOrder(name);
        if (!order) {
            return null;
        }

        const embed = new EmbedBuilder({
            title: `Order: \`${name}\``,
            description: `Created At: <t:${order.createdAt}:F>`,
            color: Colors.Gold
        });

        for (const entry of order.entries) {
            embed.addFields({
                name: entry.user.tag ?? entry.user.toString() ?? 'N/A',
                value: entry.items.length ? entry.items.map(v => `- ${v}`).join('\n') : '-',
                inline: true
            });
        }

        return embed;
    }
}