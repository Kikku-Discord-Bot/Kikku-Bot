import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { HeadSubCommand } from "./SubCommands/head.subcommands";
import { FaceSubCommand } from "./SubCommands/face.subcommands";
import { ASubGroupCommand } from "./SubGroupCommands/a.groupcommands";

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
			subCommands: [
				new HeadSubCommand(),
			],
			subCommandsGroups: [
				new ASubGroupCommand(),
			]
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
		const subCommand = interaction.options.getSubcommand();
		const subCommandGroup = interaction.options.getSubcommandGroup();

		console.log(subCommand, subCommandGroup);

		for (const subGroup of this.getSubCommandsGroups()) {
			console.log(subGroup.getName(), subCommandGroup);
			if (subGroup.getName() == subCommandGroup) {
				await subGroup.execute(client, interaction);
				return;
			}
		}

		for (const sub of this.getSubCommands()) {
			if (sub.getName() == subCommand) {
				await sub.execute(client, interaction);
				return;
			}
		}
	}
}