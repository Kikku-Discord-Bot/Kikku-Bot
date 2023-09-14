/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, ApplicationCommandOptionType, APIApplicationCommandOptionChoice, SlashCommandSubcommandGroupBuilder, LocalizationMap } from "discord.js";
import { BaseInteraction, BaseSubSlashCommand, BaseSubGroupSlashCommand, BaseClient} from "@src/structures";

export enum SlashCommandOptionType {
	USER = ApplicationCommandOptionType.User,
	CHANNEL = ApplicationCommandOptionType.Channel,
	ROLE = ApplicationCommandOptionType.Role,
	STRING = ApplicationCommandOptionType.String,
	INTEGER = ApplicationCommandOptionType.Integer,
	BOOLEAN = ApplicationCommandOptionType.Boolean,
	ATTACHMENT = ApplicationCommandOptionType.Attachment
}
export interface SlashCommandOptions {
	name: string;
	nameLocalisation?: LocalizationMap,
	descriptionLocalisation?: LocalizationMap
	description: string;
	type: SlashCommandOptionType;
	required?: boolean;
	choices?: { name: string, value: string | number }[];
}

export interface BaseSlashCommandOptions {
	name: string;
	description: string;
	nameLocalisation?: LocalizationMap,
	descriptionLocalisation?: LocalizationMap
	options?: SlashCommandOptions[];
	subCommands?: BaseSubSlashCommand[];
	subCommandsGroups?: BaseSubGroupSlashCommand[];
	cooldown?: number;
	isEnabled?: boolean;
	permissions?: bigint[];
	dmAllowed?: boolean;
}
	

/**
 * @description Base class for slash commands
 * @category BaseClass
 */
export abstract class BaseSlashCommand extends BaseInteraction {
	private slashCommand: SlashCommandBuilder;
	private subCommands: BaseSubSlashCommand[] = [];
	private subCommandsGroups: BaseSubGroupSlashCommand[] = [];
	private nameLocalizations: LocalizationMap | null;
	private descriptionLocalizations: LocalizationMap | null;
	private dmAllowed: boolean | null = false;

	constructor({ name, nameLocalisation, description, descriptionLocalisation, options, subCommands, subCommandsGroups, cooldown, isEnabled, permissions, dmAllowed }: BaseSlashCommandOptions) {
		super(name, description, options, cooldown, isEnabled, permissions);
		const bitField = permissions?.reduce((a, b) => a | b, BigInt(0)) || BigInt(1);
		
		this.nameLocalizations = nameLocalisation || null;
		this.descriptionLocalizations = descriptionLocalisation || null;
		this.dmAllowed = dmAllowed || false;
		this.subCommands = subCommands || [];
		this.subCommandsGroups = subCommandsGroups || [];

		this.slashCommand = this.buildSlashCommand(this.dmAllowed || false, bitField, options || []);
	}

	private buildSlashCommand(dmAllowed: boolean, bitField: bigint, options: SlashCommandOptions[]): SlashCommandBuilder {
		this.slashCommand = new SlashCommandBuilder()
			.setName(this.getName())
			.setDescription(this.getDescription())
			.setDMPermission(dmAllowed || false)
			.setDefaultMemberPermissions(bitField)
			.setDescriptionLocalizations(this.descriptionLocalizations || null)
			.setNameLocalizations(this.nameLocalizations || null)

		for (const subCommandsGroup of this.subCommandsGroups || []) {
			this.slashCommand.addSubcommandGroup(subCommandsGroup.getSubGroupSlashCommand());
		}

		for (const subCommand of this.subCommands || []) {
			this.slashCommand.addSubcommand(subCommand.getSubSlashCommand());
		}

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

		return this.slashCommand;
	}

	/**
	 * @description Returns the SlashCommandBuilder of the command
	 * @returns {SlashCommandBuilder}
	 *
	 */
	public getSlashCommand(): SlashCommandBuilder {
		return this.slashCommand;
	}

	/**
	 * @description Returns the subcommands of the command
	 * @returns {BaseSubSlashCommand[]}
	 *
	 */
	public getSubCommands(): BaseSubSlashCommand[] {
		return this.subCommands;
	}

	/**
	 * @description Returns the subcommands groups of the command
	 * @returns {BaseSubGroupSlashCommand[]}
	 *
	 */
	public getSubCommandsGroups(): BaseSubGroupSlashCommand[] {
		return this.subCommandsGroups;
	}

	/**
	 * @description Returns the nameLocalisation of the command
	 * @returns {LocalizationMap}
	 *
	 */
	public getNameLocalizations(): LocalizationMap | null {
		return this.nameLocalizations;
	}

	/**
	 * @description Returns the descriptionLocalisation of the command
	 * @returns {LocalizationMap}
	 *
	 */

	public getDescriptionLocalizations(): LocalizationMap | null {
		return this.descriptionLocalizations;
	}

	/**
	 * @description Add Choices to the SlashCommandBuilder
	 * @param {APIApplicationCommandOptionChoice<string | number>[]} choices
	 * @returns {void}
	 */
	public addChoices(choices: APIApplicationCommandOptionChoice<string | number>[], optionName: string): void {
		if (this.slashCommand.options.length == 0) throw new Error("You cannot add choices to a command without options!");
		for (let option of this.options)
			if (option.name == optionName) {
				for (const choice of choices) {
					if (typeof choice.value != "string" && typeof choice.value != "number")
						throw new Error("Choices must be of type string or number!");
					if ((typeof choice.value == "number" && option.type != SlashCommandOptionType.INTEGER)
						|| (typeof choice.value == "string" && option.type != SlashCommandOptionType.STRING))
						throw new Error("Choices must fit the type of the option!");
					if (option.type== SlashCommandOptionType.STRING) {
						if (option.choices) option.choices.push(choice as APIApplicationCommandOptionChoice<string>);
						else option.choices = [choice as APIApplicationCommandOptionChoice<string>];
					}
					else if (option.type == SlashCommandOptionType.INTEGER) {
						if (option.choices) option.choices.push(choice as APIApplicationCommandOptionChoice<number>);
						else option.choices = [choice as APIApplicationCommandOptionChoice<number>];
					}
				}
		}
		this.slashCommand = this.buildSlashCommand(this.dmAllowed || false, this.getPermissionValue(), this.getOptions() || []);
	}

	/**
	 * @description Remove choices the SlashCommandBuilder
	 * @param {APIApplicationCommandOptionChoice<string | number>[]} choices
	 * @returns {void}
	 *
	 */
	public removeChoices(choices: APIApplicationCommandOptionChoice<string | number>[], optionName: string): void {
		if (this.slashCommand.options.length == 0) throw new Error("You cannot remove choices from a command without options!");
		for (let option of this.options)
			if (option.name == optionName) {
				for (const choice of choices) {
					if (typeof choice.value != "string" && typeof choice.value != "number")
						throw new Error("Choices must be of type string or number!");
					if ((typeof choice.value == "number" && option.type != SlashCommandOptionType.INTEGER)
						|| (typeof choice.value == "string" && option.type != SlashCommandOptionType.STRING))
						throw new Error("Choices must fit the type of the option!");
					if (option.type== SlashCommandOptionType.STRING) {
						if (option.choices) option.choices = option.choices.filter((c: APIApplicationCommandOptionChoice<string>) => c.name != choice.name);
					}
					else if (option.type == SlashCommandOptionType.INTEGER) {
						if (option.choices) option.choices = option.choices.filter((c: APIApplicationCommandOptionChoice<number>) => c.name != choice.name);
					}
				}
			}
		this.slashCommand = this.buildSlashCommand(this.dmAllowed || false, this.getPermissionValue(), this.getOptions() || []);
	}
						 

	
	public async updateSlashCommand(client: BaseClient): Promise<void> {
		this.slashCommand = this.buildSlashCommand(this.dmAllowed || false, this.getPermissionValue(), this.getOptions() || []);
		let restSlashCommands = await client.getBaseRest().get(
			`/applications/${client.getClientId()}/commands`,
		) as unknown as any[];

		if (restSlashCommands.length == 0) return;
		if (restSlashCommands.find((command: any) => command.name == this.getName())) {
			const command = restSlashCommands.find((command: any) => command.name == this.getName());
			await client.getBaseRest().patch(
				`/applications/${client.getClientId()}/commands/${command.id}`,
				{ body: this.getSlashCommand().toJSON() },
			);
		}
	}
			
	/**
	 * @description Update the SlashCommandBuilder before registering
	 * @param {SlashCommandBuilder} slashCommand
	 * @returns {void}
	 * @example
	 */
	public async beforeRegistered(client: BaseClient): Promise<void> {
		return;
	}

	/**
	 * @description Update the SlashCommandBuilder after registering
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	public async afterRegistered(client: BaseClient):  Promise<void> {
		return;
	}


	/**
	 * @description Return the options of the command
	 * @returns {SlashCommandOptions[]}
	 * @example
	 * // returns []
	 * command.getOptions();
	 * @category Getter
	 * @protected
	 */
	public getOptions(): SlashCommandOptions[] {
		return this.options;
	}

	/**
	 * @description Return the options format of the discordAPI with subcommands and subcommandGroups
	 * @returns {{type: number, name: string, description: string; options: SlashCommandOptions[]}[]}
	 */
	public getOptionsSub(): {type: number, name: string, description: string; options: any[] | undefined}[] | undefined {
		const options: {type: number, name: string, description: string; options: any[] | undefined}[] = [];
		for (const option of this.subCommandsGroups) {
			options.push({
				type: 2,
				name: option.getName(),
				description: option.getDescription(),
				options: option.getOptionsSub(),
			});
		}

		for (const option of this.subCommands) {
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