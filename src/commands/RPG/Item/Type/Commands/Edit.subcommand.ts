import { BaseSlashCommand, BaseClient, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Edit slash command
 * @class EditSlashCommand
 * @extends BaseSubSlashCommand
 */
export class EditSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "edit",
			description: "Edit a item type",
            descriptionLocalisation: {
                fr: "Modifie un type d'objet"
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
                {
                    name: "new_name",
                    description: "The new name of the item type",
                    descriptionLocalisation: {
                        fr: "Le nouveau nom du type d'objet"
                    },
                    type: SlashCommandOptionType.STRING,
                    required: true,
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