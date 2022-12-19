import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { container } from "tsyringe";
import { FoodService } from "../services/food.service.js";

const foodService = container.resolve(FoodService);

@Discord()
export class Food {

    constructor() { }

    /**
     * Create an order to allow your friends to add their items!
     * 
     * @param name - Give your order a name!
     */
    @Slash({
        name: 'create_order',
        description: 'create a new order',
    })
    async create_order(
        @SlashOption({
            name: 'name',
            description: 'name of your order, consider it like a key to retrieve the order later',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        name: string,
        interaction: CommandInteraction,
    ) {
        foodService.createOrder(name, interaction.user);
        
        const embed = foodService.createOrderEmbed(name);

        if (!embed) {
            interaction.reply({ content: 'No order created sadly.' });
            return;
        }

        embed.setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL({ forceStatic: true })!
        });
        embed.setTimestamp(Date.now());

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * List all the orders stored in memory.
     */
    @Slash({
        description: 'list of orders'
    })
    async orders(interaction: CommandInteraction) {
        const orders = foodService.orders;
        const embed = new EmbedBuilder({
            author: {
                name: interaction.user.username,
                icon_url: interaction.user.avatarURL({ forceStatic: true })!
            },
            title: 'Orders',
            timestamp: Date.now(),
            color: Colors.White,
        });

        for (const order of orders) {
            embed.addFields({
                name: order.name,
                value: `Created By ${order.createdBy.toString()}`
            });
        }

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Find an order by name and list its details.
     * 
     * @param name - Order name to look up
     */
    @Slash({
        description: 'see the details of an order given its name'
    })
    async order(
        @SlashOption({
            name: 'name',
            description: 'order name - see `orders` command for a list of orders',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        const embed = foodService.createOrderEmbed(name);

        if (!embed) {
            await interaction.reply({ content: 'No order with that name, bawss.' });
            return;
        }

        embed.setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL({ forceStatic: true })!
        });
        embed.setTimestamp(Date.now());

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Add an item to an order under the interaction user's name.
     * 
     * @param item - An item to add to the user's list
     * @param orderName - The order name to add this item to.
     */
    @Slash({
        description: 'Add an item to an order under your name'
    })
    async add_item_to_order(
        @SlashOption({
            name: 'item',
            description: 'item description - free text',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        item: string,
        @SlashOption({
            name: 'order_name',
            description: 'order name',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        orderName: string,
        interaction: CommandInteraction,
    ) {
        const order = foodService.getOrder(orderName);

        if (!order) {
            interaction.reply({ content: 'No order with that name, bawss!' });
            return;
        }

        order.addOrderEntry(item, interaction.user);

        const embed = foodService.createOrderEmbed(orderName);

        if (!embed) {
            await interaction.reply({ content: 'No order with that name, bawss.' });
            return;
        }

        embed.setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL({ forceStatic: true })!
        });
        embed.setTimestamp(Date.now());

        await interaction.reply({ embeds: [embed] });
    }

}