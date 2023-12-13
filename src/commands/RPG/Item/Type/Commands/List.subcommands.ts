import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description List slash command
 * @class ListSlashCommand
 * @extends BaseSubSlashCommand
 */
export class ListSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "list",
			description: "List all item types",
            descriptionLocalisation: {
                fr: "Liste tous les types d'objets"
            },
        })
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle("Work in progress...")
            .setDescription(`This command is still in development, please wait for the next update`)
            .setColor(Colors.DarkOrange);

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
}