import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { randomInt } from "crypto";

/**
 * @description HeadTales command
 * @class HeadTales
 * @extends BaseCommand
 */
export class HeadTalesCommand extends BaseSlashCommand {
	constructor() {
		super({
			name: "headtales",
			description: "HeadTales",
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
			content: randomInt(0, 1) === 0 ? "Heads" : "Tails",
		});
	}
}