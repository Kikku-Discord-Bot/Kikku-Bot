import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, BaseSubSlashCommand } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";

/**
 * @description HeadTales command
 * @class HeadTales
 * @extends BaseSubSlashCommand
 */
export class HeadSubCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "head",
			description: "HeadTales",
			options: [],
		});
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply({
			content: "Head",
			ephemeral: true,
		});
		const moduleGame = client.getModule("Game");
		const moduleGameHandler = moduleGame.getDatabaseHandler();


		const UsersRow = await moduleGameHandler.getRowsOfUser(interaction.user.id);
		console.log(UsersRow);
		if (!UsersRow || UsersRow.length === 0) {
			console.log("create");
			await moduleGameHandler.createRowUser({ userId: interaction.user.id, numberOfHead: 0});
		}

		
	}
}