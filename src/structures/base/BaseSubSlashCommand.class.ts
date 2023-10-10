/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, ApplicationCommandOptionType, APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSlashCommand, SlashCommandOptionType, BaseSlashCommandOptions } from "@src/structures";

/**
 * @description Base class for sub slash commands
 * @category BaseClass
 */
export abstract class BaseSubSlashCommand extends BaseSlashCommand {
	private subCommand: SlashCommandSubcommandBuilder;

	constructor({ name, description, options, cooldown, isEnabled, permissions, dmAllowed }: BaseSlashCommandOptions) {
		super({ name, description, options, cooldown, isEnabled, permissions, dmAllowed })
		this.subCommand = new SlashCommandSubcommandBuilder()
			.setName(this.getName())
			.setDescription(this.getDescription())

		for (const option of options || []) {
			if (!option.choices) {
				if (option.type == SlashCommandOptionType.STRING)
					this.subCommand.addStringOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false).setAutocomplete(option.autocomplete || false));
				else if (option.type == SlashCommandOptionType.USER)
					this.subCommand.addUserOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.CHANNEL)
					this.subCommand.addChannelOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.INTEGER)
					this.subCommand.addIntegerOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false).setAutocomplete(option.autocomplete || false));
				else if (option.type == SlashCommandOptionType.ROLE)
					this.subCommand.addRoleOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.BOOLEAN)
					this.subCommand.addBooleanOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
			} else {
				if (option.type == SlashCommandOptionType.STRING) {
					for (const choice of option.choices)
						if (typeof choice.value != "string")
							throw new Error("Choices must be of type string or number!");
					this.subCommand.addStringOption(opt => 
						opt.setName(option.name).
							setDescription(option.description).
							setRequired(option.required || false).
							setChoices(...option.choices as APIApplicationCommandOptionChoice<string>[])
							.setAutocomplete(option.autocomplete || false))
				} else if (option.type == SlashCommandOptionType.USER)
					throw new Error("User options cannot have choices!");
				else if (option.type == SlashCommandOptionType.CHANNEL)
					throw new Error("Channel options cannot have choices!");
				else if (option.type == SlashCommandOptionType.INTEGER) {
					for (const choice of option.choices)
						if (typeof choice.value != "number")
							throw new Error("Choices must be of type string or number!");
					this.subCommand.addNumberOption(opt => 
						opt.setName(option.name).
							setDescription(option.description).
							setRequired(option.required || false).
							setChoices(...option.choices as APIApplicationCommandOptionChoice<number>[])
							.setAutocomplete(option.autocomplete || false))
				} else if (option.type == SlashCommandOptionType.ROLE)
					throw new Error("Role options cannot have choices!");
				else if (option.type == SlashCommandOptionType.BOOLEAN)
					throw new Error("Boolean options cannot have choices!");
			}
		}
	}

	/**
	 * @description Returns the slash command
	 * @returns {SlashCommandBuilder}
	 */
	public getSubSlashCommand(): SlashCommandSubcommandBuilder {
		return this.subCommand;
	}
}
