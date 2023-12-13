import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Create slash command
 * @class CreateSlashCommand
 * @extends BaseSubSlashCommand
 */
export class CreateSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "create",
			description: "create a new item type",
            descriptionLocalisation: {
                fr: "Crée un nouveau type d'objet"
            },
            options: [
                {
                    name: "name",
                    description: "The name of the item type",
                    descriptionLocalisation: {
                        fr: "Le nom du type d'objet"
                    },
                    type: SlashCommandOptionType.STRING,
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