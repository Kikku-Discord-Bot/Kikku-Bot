import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { TypeSlashCommand } from "./Type/Type.subgroup";
import { CreateSlashCommand } from "./Commands/Create.subcommand";
import { DeleteSlashCommand } from "./Commands/Delete.subcommand";
import { EditSlashCommand } from "./Commands/Edit.subcommand";
import { InfoSlashCommand } from "./Commands/Info.subcommand";

/**
 * @description Item slash command
 * @class ItemSlashCommand
 * @extends BaseSlashCommand
 */
export class ItemSlashCommand extends BaseSlashCommand {
	constructor() {
		super({
            name: "item",
            description: "item configuration",
            subCommandsGroups: [
                new TypeSlashCommand(),
            ],
            subCommands: [
                new CreateSlashCommand(),
                new DeleteSlashCommand(),
                new EditSlashCommand(),
                new InfoSlashCommand()
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
        const subGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand(true);

        if (!subGroup) {
            for (const sub of this.getSubCommands()) {
                if (sub.getName() === subCommand) {
                    return sub.execute(client, interaction);
                }
            }
        } else {
            for (const sub of this.getSubCommandsGroups()) {
                if (sub.getName() === subGroup) {
                    for (const subSub of sub.getSubCommands()) {
                        if (subSub.getName() === subCommand) {
                            return subSub.execute(client, interaction);
                        }
                    }
                }
            }
        }
	}

    /**
     * @description Auto complete the response
     * @param {interaction} AutocompleteInteraction
     * @returns {Promise<void>}
     */
    async autoComplete(interaction: AutocompleteInteraction, client: BaseClient): Promise<void> {
        const subGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand(true);

        if (!subGroup) {
            for (const sub of this.getSubCommands()) {
                if (sub.getName() === subCommand) {
                    return sub.autoComplete(interaction, client);
                }
            }
        } else {
            for (const sub of this.getSubCommandsGroups()) {
                if (sub.getName() === subGroup) {
                    for (const subSub of sub.getSubCommands()) {
                        if (subSub.getName() === subCommand) {
                            return subSub.autoComplete(interaction, client);
                        }
                    }
                }
            }
        }
    }
}
