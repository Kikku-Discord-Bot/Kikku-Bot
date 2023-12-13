import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler, ItemHandler } from "kikku-database-middleware";
/**
 * @description Edit slash command
 * @class EditSlashCommand
 * @extends BaseSubSlashCommand
 */
export class EditSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "edit",
			description: "Edit a item",
            descriptionLocalisation: {
                fr: "Modifie un objet"
            },
            options: [
                {
                    name: "name",
                    description: "The name of the item",
                    descriptionLocalisation: {
                        fr: "Le nom de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                    autocomplete: true,
                    required: true,
                },
                {
                    name: "new_name",
                    description: "The new name of the item",
                    descriptionLocalisation: {
                        fr: "Le nouveau nom de l'objet"
                    },
                    type: SlashCommandOptionType.STRING,
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
        const newName = interaction.options.getString("new_name");
        const description = interaction.options.getString("description");
        const price = interaction.options.getInteger("price");
        const stocks = interaction.options.getInteger("stocks");
        const useable = interaction.options.getBoolean("useable");
        const tradeable = interaction.options.getBoolean("tradeable");
        const sellable = interaction.options.getBoolean("sellable");
        const image = interaction.options.getString("image");
        const type = interaction.options.getString("type");
        const unique = interaction.options.getBoolean("unique");

        const item = await ItemHandler.getItemByNameAndGuild(name, interaction.guild.id);

        if (!item) {
            const embed = new EmbedBuilder()
                .setTitle("Item not found")
                .setDescription("The item you are trying to edit doesn't exist")
                .setColor(Colors.Red)

            await interaction.reply({
                embeds: [
                    embed
                ]
            });
            return;
        }

        item.name = newName || item.name;
        item.type = type || item.type;
        if (item.data) {
            item.data.description = description || item.data.description;
            item.data.price = price || item.data.price;
            item.data.quantity = stocks || item.data.quantity;
            item.data.image = image || item.data.image;
            item.data.useable = useable || item.data.useable;
            item.data.tradeable = tradeable || item.data.tradeable;
            item.data.sellable = sellable || item.data.sellable;
            item.data.is_stackable = unique! || item.data.is_stackable;
        }
        item.save();

        let fields = [];

        description ? fields.push({name: 'description', value: description, inline: false}) : fields.push({name: 'description', value: 'noDescription', inline: false});
        price && price > 0  ? fields.push({name: "price", value: price.toString(), inline: true}) : fields.push({name: "price", value: 'free', inline: true});
        stocks && stocks > 0 ? fields.push({name: "stocks", value: stocks.toString(), inline: true}) : fields.push({name: "stocks", value: "unlimited", inline: true});
        type ? fields.push({name: "type", value: type, inline: true}) : fields.push({name: "type", value: "noType", inline: true});
        useable ? fields.push({name: "useable", value: "yes", inline: true}) : fields.push({name: "useable", value: "no", inline: true});
        tradeable ? fields.push({name: "tradeable", value: "yes", inline: true}) : fields.push({name: "tradeable", value: "no", inline: true});
        sellable ? fields.push({name: "sellable", value: "yes", inline: true}) : fields.push({name: "sellable", value: "no", inline: true});
        // image ? fields.push({name: "Image", value: image, inline: true}) : fields.push({name: "Image", value: "No image", inline: true});
        unique ? fields.push({name: "unique", value: "yes", inline: true}) : fields.push({name: "unique", value: "no", inline: true});
            
        const embed = new EmbedBuilder()
            .setTitle(name + " created")
            .setDescription(description || "")
            .setColor(Colors.Green)
            .setFields(fields)
            .setThumbnail(image || "")

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }

     /**
     * @description Executes the autocomplete command
     * @param {BaseClient} client
     * @param {AutocompleteInteraction} interaction
     * @returns {Promise<void>}
     */
     async autocomplete(client: BaseClient, interaction: AutocompleteInteraction): Promise<void> {
        if (!interaction.guild) {
            throw new Error("Guild not found");
        }

        const focused = interaction.options.getFocused();
        const items = await ItemHandler.getItemsByGuild(interaction.guild.id);
        let choices = [];

        if (!items) {
            await interaction.respond(
               [{ name: "name", value: "No items found" }],
            );
            return;
        }

        for(const item of items) {
            const key = item.name;
            const value = item.name;
            choices.push({
                name: value,
                value: key
            })
        
        }

        const filteredChoices = choices.filter((choice: any) => {
            return choice.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().startsWith(focused.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
        }).slice(0, 25);

        await interaction.respond(
            filteredChoices.map((choice: { name: any; value: any; }) => ({ name: choice.name, value: choice.value }))
        );
    }
}