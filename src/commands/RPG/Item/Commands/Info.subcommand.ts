import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler, ItemHandler } from "kikku-database-middleware";
/**
 * @description Info slash command
 * @class InfoSlashCommand
 * @extends BaseSubSlashCommand
 */
export class InfoSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "info",
			description: "Information about a item",
            descriptionLocalisation: {
                fr: "Information sur un objet"
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

        const item = await ItemHandler.getItemByNameAndGuild(name, interaction.guild.id);

        if (!item) {
            const embed = new EmbedBuilder()
                .setTitle("Item not found")
                .setDescription("The item you are inspect doesn't exist")
                .setColor(Colors.Red)

            await interaction.reply({
                embeds: [
                    embed
                ]
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(name + " info")
            .setDescription(item.data?.description || "")
            .setColor(Colors.Green)
            .setThumbnail(item.data?.image || "")

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