import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand } from "@src/structures";
import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { CreateSlashCommand } from "./Commands/Create.subcommand";
import { DeleteSlashCommand } from "./Commands/Delete.subcommand";
import { EditSlashCommand } from "./Commands/Edit.subcommand";
import { ListSlashCommand } from "./Commands/List.subcommands";

/**
 * @description Type slash command
 * @class TypeSlashCommand
 * @extends BaseSlashCommand
 */
export class TypeSlashCommand extends BaseSubGroupSlashCommand {
	constructor() {
		super({
            name: "type",
            description: "Item type configuration",
            subCommands: [
                new CreateSlashCommand(),
                new DeleteSlashCommand(),
                new EditSlashCommand(),
                new ListSlashCommand()
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
