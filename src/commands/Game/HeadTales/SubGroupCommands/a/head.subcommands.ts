import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, BaseSubSlashCommand } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";

/**
 * @description HeadTales command
 * @class HeadTales
 * @extends BaseSubSlashCommand
 */
export class HeadSubCommandA extends BaseSubSlashCommand {
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
    }
}