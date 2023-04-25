import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction } from "discord.js";

/**
 * @description Pong slash command
 * @class Pong
 * @extends BaseSlashCommand
 */
export class PongSlashCommand extends BaseSlashCommand {
	constructor() {
		super("pong", "Ping! Pong!", [], 0, true, []);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("Ping!");
	}
}
