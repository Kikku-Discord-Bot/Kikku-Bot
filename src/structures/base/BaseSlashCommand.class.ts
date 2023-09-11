/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, ApplicationCommandOptionType, APIApplicationCommandOptionChoice } from "discord.js";
import { BaseInteraction } from "@src/structures";

export enum SlashCommandOptionType {
	USER = ApplicationCommandOptionType.User,
	CHANNEL = ApplicationCommandOptionType.Channel,
	ROLE = ApplicationCommandOptionType.Role,
	STRING = ApplicationCommandOptionType.String,
	INTEGER = ApplicationCommandOptionType.Integer,
	BOOLEAN = ApplicationCommandOptionType.Boolean
}
export interface SlashCommandOptions {
	name: string;
	description: string;
	required?: boolean;
	choices?: APIApplicationCommandOptionChoice<string | number>[];
	type: SlashCommandOptionType
}

/**
 * @description Base class for slash commands
 * @category BaseClass
 */
export abstract class BaseSlashCommand extends BaseInteraction {
	private slashCommand: SlashCommandBuilder;

	constructor(name: string, description: string, options?: SlashCommandOptions[], cooldown?: number, isEnabled?: boolean, permissions?: bigint[], dmAllowed?: boolean) {
		super(name, description, options, cooldown, isEnabled, permissions);
		const bitField = permissions?.reduce((a, b) => a | b, BigInt(0)) || BigInt(1);
		
		this.slashCommand = new SlashCommandBuilder()
			.setName(this.getName())
			.setDescription(this.getDescription())
			.setDMPermission(dmAllowed || false)
			.setDefaultMemberPermissions(bitField)
		for (const option of options || []) {
			if (!option.choices) {
				if (option.type == SlashCommandOptionType.STRING)
					this.slashCommand.addStringOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.USER)
					this.slashCommand.addUserOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.CHANNEL)
					this.slashCommand.addChannelOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.INTEGER)
					this.slashCommand.addIntegerOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.ROLE)
					this.slashCommand.addRoleOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
				else if (option.type == SlashCommandOptionType.BOOLEAN)
					this.slashCommand.addBooleanOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required || false));
			} else {
				if (option.type == SlashCommandOptionType.STRING) {
					for (const choice of option.choices)
						if (typeof choice.value != "string")
							throw new Error("Choices must be of type string or number!");
					this.slashCommand.addStringOption(opt => 
						opt.setName(option.name).
							setDescription(option.description).
							setRequired(option.required || false).
							setChoices(...option.choices as APIApplicationCommandOptionChoice<string>[]))
				} else if (option.type == SlashCommandOptionType.USER)
					throw new Error("User options cannot have choices!");
				else if (option.type == SlashCommandOptionType.CHANNEL)
					throw new Error("Channel options cannot have choices!");
				else if (option.type == SlashCommandOptionType.INTEGER) {
					for (const choice of option.choices)
						if (typeof choice.value != "number")
							throw new Error("Choices must be of type string or number!");
					this.slashCommand.addNumberOption(opt => 
						opt.setName(option.name).
							setDescription(option.description).
							setRequired(option.required || false).
							setChoices(...option.choices as APIApplicationCommandOptionChoice<number>[]))
				} else if (option.type == SlashCommandOptionType.ROLE)
					throw new Error("Role options cannot have choices!");
				else if (option.type == SlashCommandOptionType.BOOLEAN)
					throw new Error("Boolean options cannot have choices!");
			}
		}
	}

	/**
	 * @description Returns the SlashCommandBuilder of the command
	 * @returns {SlashCommandBuilder}
	 *
	 */
	public getSlashCommand(): SlashCommandBuilder {
		return this.slashCommand;
	}
}