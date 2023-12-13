/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, ApplicationCommandOptionType, APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, LocalizationMap } from "discord.js";
import { BaseInteraction, SlashCommandOptionType, BaseSlashCommandOptions, BaseSubSlashCommand, SlashCommandOptions, BaseSlashCommand } from "@src/structures";

export interface BaseSlashGroupCommandOptions {
	name: string;
	description: string;
	nameLocalisation?: LocalizationMap,
	descriptionLocalisation?: LocalizationMap
	options?: SlashCommandOptions[];
	subCommands?: BaseSubSlashCommand[];
	cooldown?: number;
	isEnabled?: boolean;
	permissions?: bigint[];
	dmAllowed?: boolean;
}

/**
 * @description Base class for sub slash commands
 * @category BaseClass
 */
export abstract class BaseSubGroupSlashCommand extends BaseSlashCommand {
	private subGroup: SlashCommandSubcommandGroupBuilder;

	constructor({ name, description, options, subCommands, cooldown, isEnabled, permissions, dmAllowed }: BaseSlashGroupCommandOptions) {
		super({ name, description, options, subCommands, cooldown, isEnabled, permissions, dmAllowed })
		this.subGroup = new SlashCommandSubcommandGroupBuilder()
			.setName(this.getName())
			.setDescription(this.getDescription())


		for (const subCommand of this.getSubCommands()) {
			this.subGroup.addSubcommand(subCommand.getSubSlashCommand());
		}
	}

	/**
	 * @description Returns the slash command
	 * @returns {SlashCommandBuilder}
	 */
	public getSubGroupSlashCommand(): SlashCommandSubcommandGroupBuilder {
		return this.subGroup;
	}
	/**
	 * @description Return the options format of the discordAPI with subcommands and subcommandGroups
	 * @returns {{type: number, name: string, description: string; options: SlashCommandOptions[]}[]}
	 */
	public getOptionsSub(): {type: number, name: string, description: string; options: any[]}[] | undefined {
		const options: {type: number, name: string, description: string; options: any[]}[] = [];
		for (const option of this.getSubCommands()) {
			options.push({
				type: 1,
				name: option.getName(),
				description: option.getDescription(),
				options: option.getOptions(),
			});
		}
		if (options.length > 0) {
			return options;
		} else {
			return undefined;
		}
	}
}
