import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler, ItemHandler } from "kikku-database-middleware";
/**
 * @description Create slash command
 * @class CreateSlashCommand
 * @extends BaseSubSlashCommand
 */
export class CreateSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "create",
			description: "create a new item",
            descriptionLocalisation: {
                fr: "Crée un nouvel objet"
            },
            options: [
                {
                    name: "name",
                    description: "The name of the item",
                    descriptionLocalisation: {
                        fr: "Le nom de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                    required: true,
                },
                {
                    name: "description",
                    description: "The description of the item",
                    descriptionLocalisation: {
                        fr: "La description de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                },
                {
                    name: "price",
                    description: "The price of the item",
                    descriptionLocalisation: {
                        fr: "Le prix de l'objet"
                    },
                    type: SlashCommandOptionType.INTEGER,
                },
                {
                    name: "stocks",
                    description: "The stocks of the item",
                    descriptionLocalisation: {
                        fr: "Le stock de l'objet"
                    },
                    type: SlashCommandOptionType.INTEGER,
                },
                {
                    name: "useable",
                    description: "can the item be used",
                    descriptionLocalisation: {
                        fr: "L'objet peut-il être utilisé"
                    },
                    type: SlashCommandOptionType.BOOLEAN,
                },
                {
                    name: "tradeable",
                    description: "can the item be traded",
                    descriptionLocalisation: {
                        fr: "L'objet peut-il être échangé"
                    },
                    type: SlashCommandOptionType.BOOLEAN,
                },
                {
                    name: "sellable",
                    description: "can the item be sold",
                    descriptionLocalisation: {
                        fr: "L'objet peut-il être vendu"
                    },
                    type: SlashCommandOptionType.BOOLEAN,
                },
                {
                    name: "image",
                    description: "The image of the item",
                    descriptionLocalisation: {
                        fr: "L'image de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                },
                {
                    name: "type",
                    description: "The type of the item",
                    descriptionLocalisation: {
                        fr: "Le type de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                    autocomplete: true,
                },
                {
                    name: "unique",
                    description: "Is the item unique",
                    descriptionLocalisation: {
                        fr: "L'objet est-il unique"
                    },
                    type: SlashCommandOptionType.BOOLEAN,
                }
            ],
        })
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guild) {
            throw new Error("Guild not found");
        }

        const name = interaction.options.getString("name", true);
        const description = interaction.options.getString("description");
        const price = interaction.options.getInteger("price");
        const stocks = interaction.options.getInteger("stocks");
        const useable = interaction.options.getBoolean("useable");
        const tradeable = interaction.options.getBoolean("tradeable");
        const sellable = interaction.options.getBoolean("sellable");
        const image = interaction.options.getString("image");
        const type = interaction.options.getString("type");
        const unique = interaction.options.getBoolean("unique");

        const item = await ItemHandler.createItem(name, type || "default",
            {
                description: description || "",
                price: price || 0,
                quantity: stocks || -1,
                image: image || "",
                tradeable: tradeable || false,
                useable: useable || false,
                sellable: sellable || true,
                is_stackable: unique! || false,
                special: {}
            })

        const embed = new EmbedBuilder()
            .setTitle(name + " edit")
            .setDescription(item.data?.description || "")
            .setColor(Colors.Green)
            .setThumbnail(item.data?.image || "")

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
}