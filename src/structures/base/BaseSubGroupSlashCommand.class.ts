/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, ApplicationCommandOptionType, APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { BaseInteraction, SlashCommandOptionType, BaseSlashCommandOptions, BaseSubSlashCommand } from "@src/structures";

/**
 * @description Base class for sub slash commands
 * @category BaseClass
 */
export abstract class BaseSubGroupSlashCommand extends BaseInteraction {
	private subGroup: SlashCommandSubcommandGroupBuilder;
	private subCommands: BaseSubSlashCommand[] = [];

	constructor({ name, description, options, subCommands, cooldown, isEnabled, permissions, dmAllowed }: BaseSlashCommandOptions) {
		super(name, description, options, cooldown, isEnabled, permissions);
		this.subGroup = new SlashCommandSubcommandGroupBuilder()
			.setName(this.getName())
			.setDescription(this.getDescription())
		
		for (const subCommand of subCommands || []) {
			this.subGroup.addSubcommand(subCommand.getSubSlashCommand());
			this.subCommands.push(subCommand);
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
	 * @description Returns the sub commands
	 * @returns {BaseSubSlashCommand[]}
	 */
	public getSubCommands(): BaseSubSlashCommand[] {
		return this.subCommands;
	}
}
