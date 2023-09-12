import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, BaseSubSlashCommand, BaseSubGroupSlashCommand } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { FaceSubCommand } from "./face.subcommands";
import { HeadSubCommandA } from "./a/head.subcommands";
import { FaceSubCommandA } from "./a/face.subcommands";

/**
 * @description HeadTales command
 * @class HeadTales
 * @extends BaseSubSlashCommand
 */
export class ASubGroupCommand extends BaseSubGroupSlashCommand {
    constructor() {
        super({
            name: "a",
            description: "HeadTales",
            options: [],
            subCommands: [
                new HeadSubCommandA(),
                new FaceSubCommandA(),
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
        const subCommand = interaction.options.getSubcommand(true);

		for (const sub of this.getSubCommands()) {
			if (sub.getName() == subCommand) {
				await sub.execute(client, interaction);
				return;
			}
		}
    }
}