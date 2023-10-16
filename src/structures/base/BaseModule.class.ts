/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseCommand, BaseInteraction, BaseClient, BaseSlashCommand } from "@src/structures";
import * as Sequelize from "sequelize";
import { Client, Locale, Routes } from "discord.js";
import fs from "fs";
import { Exception } from "../exception/exception.class";
import { type } from "os";
import { DBConnection } from "../database/dbConnection.db.class";
import Module from "module";
import { DatabaseModuleHandler, DatabaseSchemaName } from "../database/ModuleHandler.class";

interface DatabaseFieldSchema {
	name: string;
	type: Sequelize.DataType;
	allowNull?: boolean;
	defaultValue?: unknown;
}

interface DatabaseGlobalSchema {
	fields: Array<DatabaseFieldSchema>;
	enabled?: boolean;
	timestamps?: boolean;
	createdAt?: boolean;
	updatedAt?: boolean;
}

interface DatabaseUserSchema {
	fields: Array<DatabaseFieldSchema>;
	enabled?: boolean;
	timestamps?: boolean;
	createdAt?: boolean;
	updatedAt?: boolean;
}

interface DatabaseGuildSchema {
	fields: Array<DatabaseFieldSchema>;
	enabled?: boolean;
	timestamps?: boolean;
	createdAt?: boolean;
	updatedAt?: boolean;
}

export interface DatabaseSchemas {
	global?: DatabaseGlobalSchema;
	user?: DatabaseUserSchema;
	guild?: DatabaseGuildSchema;
}

/**
 * @description Base class for modules
 * @category BaseClass
 */
export abstract class BaseModule {

	private name: string;
	private interactions: Map<string, BaseInteraction> = new Map();
	private aliases: Map<string, BaseCommand> = new Map();
	private enabled: boolean;
	private description: string;
	private databaseHandler: DatabaseModuleHandler;
	// May need to change this to a Collection<string, BaseCommand> if we want to add more properties to the commands same goes the aliases
	// private commands: Collection<string, BaseCommand> = new Collection();
	private commands: Map<string, BaseCommand> = new Map();
	private databaseSchemas?: DatabaseSchemas;

	/**
	 * @description Creates a new module
	 * @param name 
	 * @param isEnabled 
	 */
	constructor(name: string, description?: string, isEnabled?: boolean, databaseSchemas?: DatabaseSchemas ) {
		this.name = name;
		this.description = description || "No description provided";
		this.enabled = isEnabled || true;
		this.databaseSchemas = databaseSchemas;
		this.databaseHandler = new DatabaseModuleHandler(this.name);
	}

	public static get(client: BaseClient): BaseModule {
		const className = this.prototype.constructor.name.replace("Module", "");
		try {
			client.getModule(className);
		} catch {
			throw new Error(`The module ${className} is not found`);
		}
		throw new Error("The method 'get' must be implemented in the module");
	}

	/**
	 * @description Return interactions of the module
	 * @returns {Map<string, BaseInteraction>}
	 * @example
	 * // returns Map(1) { 'ping' => [Function: Ping] }
	 * module.getInteractions();
	 */
	public getInteractions(): Map<string, BaseInteraction> {
		return this.interactions;
	}

	/**
	 * @description Returns the name of the module
	 * @returns {string}
	 */
	public getName(): string {
		return this.name;
	}
		

	/**
	 * @description Returns the description of the module
	 * @returns {string}
	 */
	public getDescription(): string {
		return this.description;
	}


	/**
	 * @description Returns the database handler of the module
	 * @returns {DatabaseModuleHandler}
	 */
	public getDatabaseHandler(): DatabaseModuleHandler {
		return this.databaseHandler;
	}

	/**
	 * @description Returns the active status of the module
	 * @returns {boolean}
	 * @example
	 * // returns true
	 * module.isEnabled();
	 */
	public isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * @description Sets the isEnabled status of the module
	 * @param {boolean} isEnabled
	 * @example
	 * // sets the isEnabled status to false
	 * module.setActive(false);
	 */
	public setisEnabled(isEnabled: boolean): void {
		this.enabled = isEnabled;
	}

	/**
	 * @description Returns the commands of the module
	 * @returns {Map<string, BaseCommand>}
	 * @example
	 * // returns Map(1) { 'ping' => [Function: Ping] }
	 * module.getCommands();
	 */
	public getCommands(): Map<string, BaseCommand> {
		return this.commands;
	}
	
	/**
	 * @description Checks if the module has a command
	 * @param {string} name
	 * @returns {boolean}
	 * @example
	 * // returns true
	 * module.hasCommand('ping');
	 */
	public hasCommand(name: string): boolean {
		return this.commands.has(name) || this.aliases.has(name);
	}

	/**
	 * @description Returns a command from the module
	 * @param {string} name
	 * @returns {BaseCommand | undefined}
	 * @example
	 * // returns [Function: Ping]
	 * module.getCommand('ping');
	 */
	public getCommand(name: string): BaseCommand | undefined {
		if (this.commands.has(name)) return this.commands.get(name);
		if (this.aliases.has(name)) return this.aliases.get(name);
		return undefined;
	}


	/**
	 * @description Returns the database schemas of the module
	 * @returns {DatabaseSchemas | undefined}
	 * @example
	 * // returns { globalSchema: { fields: [ [Object] ] } }
	 */
	public getDatabaseSchemas(): DatabaseSchemas | undefined {
		return this.databaseSchemas;
	}


	/**
	 * @description Loads module database schemas into the database
	 * @param {Sequelize.Sequelize} database
	 * @example
	 * // loads module database schemas into the database
	 * module.loadDatabaseSchemas(database);
	 * @example
	 */
	async loadDatabaseSchemas() {
		const database = DBConnection.getInstance().sequelize;
		if (!this.databaseSchemas) return;
		const schemas = Object.entries(this.databaseSchemas);
		for (const [schemaName, schema] of schemas) {
			if (schema.enabled === false) continue;
			const schemaOptions = {
				timestamps: schema.timestamps,
				createdAt: schema.createdAt,
				updatedAt: schema.updatedAt,
			}

			const schemaFields: any = {};
			for (const field of schema.fields) {
				schemaFields[field.name] = {
					type: field.type,
					allowNull: field.allowNull ? field.allowNull : false,
				}

				if (field.defaultValue !== undefined) {
					schemaFields[field.name].defaultValue = field.defaultValue;
				}
			}
			if (schemaName === "user") {
				schemaFields["userId"] = {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}
			}

			if (schemaName === "guild") {
				schemaFields["guildId"] = {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}
			}
			const realSchemaName = this.databaseHandler.getSchemaName(schemaName);
			const schemaModel = database.define(realSchemaName + "_" + this.getName(), schemaFields, schemaOptions);
			this.databaseHandler.setSchema(realSchemaName, schemaModel);
			await schemaModel.sync();
		}
	}


	/**
	 * @description Loads commands into the module
	 * @param {string} path
	 * @example
	 * // loads commands from src\commands\ping
	 * module.loadCommands('src/commands/ping');
	 * @example
	 */
	async loadCommands(path: string) {
		const commandFiles = await fs.promises.readdir(path);
		for (const file of commandFiles) {
			const lstat = await fs.promises.lstat(`${path}/${file}`);
			if (lstat.isDirectory()) {
				this.loadCommands(`${path}/${file}`);
				continue;
			}
			if (!file.endsWith("command.ts")) continue;
			const Command = (await import(`${path}/${file}`));
			for (const kVal in Object.keys(Command)) {
				const value = Object.values(Command)[kVal];
				try {
					const command = new (value as any)();
					this.commands.set(command.name, command);
					if (!command.aliases) continue;
					for (const alias of command.aliases) {
						this.aliases.set(alias, command);
					}
				} catch (error: unknown) {
					if (error instanceof Error)
						throw new Exception(error.message)
				}
			}
		}
	}

	/**
	 * @description Loads slash commands into the module
	 * @param {string} path
	 * @param path 
	 */
	async loadSlashCommands(path: string): Promise<void> {
		const commandFiles = await fs.promises.readdir(path);
		for (const file of commandFiles) {
			const lstat = await fs.promises.lstat(`${path}/${file}`);
			if (lstat.isDirectory()) {
				await this.loadSlashCommands(`${path}/${file}`);
				continue;
			}
			if (!file.endsWith("interaction.ts")) continue;
			const Interaction = (await import(`${path}/${file}`));
			for (const kVal in Object.keys(Interaction)) {
				const value = Object.values(Interaction)[kVal];
				try {
					const interaction = new (value as any)();
					this.interactions.set(interaction.name, interaction);
				} catch (error) {
					console.error(error);
					console.log(`Could not load interaction ${path}/${file}`);
				}
			}
		}
	}

	/**
	 * @description Registers slash commands
	 * @param {BaseClient} client Discord Client
	 * @param {string?} guildId Guild ID
	 * @example
	 * // registers slash commands globally
	 * module.registerSlashCommands(client);
	 * @example
	 * // registers slash commands in a guild
	 * module.registerSlashCommands(client, '123456789');
	 */
	public async registerSlashCommands(client: BaseClient, alreadyAdded: Array<any> , guildId?: string): Promise<{ hasChanged: boolean; registered: string[]; }> {
		const toRegister: any = [];
		const registered = [];
		let hasChanged = false;
		for (const [, interaction] of this.interactions) {
			if (!(interaction instanceof BaseSlashCommand)) continue;
			registered.push(interaction.getName());
			const match = alreadyAdded.find(i => i.name === interaction.getName());
			const statusIsChanged = this.isChanged(interaction, match)
			if (match && !statusIsChanged) {
				console.log(`Interaction ${interaction.getName()} already added`);
				continue;
			}
			this.printChangement(statusIsChanged);
			toRegister.push(interaction.getSlashCommand().toJSON());
		}
		
		if (toRegister.length === 0) {
			console.log(`No slash commands to register for module ${this.name}`);
			return {hasChanged, registered};
		}
		
		console.table(toRegister)
		if (!guildId) {
			for (const command of toRegister) {
				await client.getBaseRest().post(
					Routes.applicationCommands(client.getClientId()),
					{ body: command }
				)
			}
		} else {
			for (const command of toRegister) {
				await client.getBaseRest().post(
					Routes.applicationGuildCommands(client.getClientId(), guildId),
					{ body: command }
				)
			}
		}
		hasChanged = true;

		return { hasChanged, registered };
	}

	private printChangement(index: number): boolean {
		switch (index) {
		case 1:
			console.log("Interaction is new");
			break;
		case 2:
			console.log("Interaction description has changed");
			break;
		case 3:
			console.log("Interaction localizations has changed");
			break;
		case 4:
			console.log("Interaction permissions has changed");
			break;
		case 5:
			console.log("Interaction options has changed");
			break;
		case 6:
			console.log("Interaction permissions has changed");
			break;
		default:
			console.log("Interaction has not changed");
			break;
		}
		return index != 0;
	}

	private isChanged(interaction: BaseSlashCommand, restInteraction: any): number {
		const isLocalizationsChanged = (interaction: BaseSlashCommand, restInteraction: any): boolean => {
			if (interaction.getNameLocalizations() != null && restInteraction.name_localizations == null) return true;
			if (interaction.getNameLocalizations() == null && restInteraction.name_localizations != null) return true;
			if ((interaction.getNameLocalizations() !== restInteraction.name_localizations) && interaction.getNameLocalizations() != null && restInteraction.name_localizations != null) {
				const keys = Object.entries(Locale).filter(([, value]) => typeof value === "string").map(([, value]) => value);
				for (const key of keys) {
					if (interaction.getNameLocalizations()![key] !== restInteraction.name_localizations[key]) {
						console.log(interaction.getNameLocalizations()![key], restInteraction.name_localizations[key])
						return true;
					}
				}
			}
			if (interaction.getDescriptionLocalizations() != null && restInteraction.description_localizations == null) return true;
			if (interaction.getDescriptionLocalizations() == null && restInteraction.description_localizations != null) return true;
			if ((interaction.getDescriptionLocalizations() !== restInteraction.description_localizations) && interaction.getDescriptionLocalizations() != null && restInteraction.description_localizations != null) {
				const keys = Object.entries(Locale).filter(([, value]) => typeof value === "string").map(([, value]) => value);
				for (const key of keys) {
					if (interaction.getDescriptionLocalizations()![key] !== restInteraction.description_localizations[key]) {
						console.log(interaction.getDescriptionLocalizations()![key], restInteraction.description_localizations[key])
						return true;
					}
				}
			}

			for (const option of interaction.getOptions()) {
				const restOption = restInteraction.options.find((o: any) => o.name === option.name);
				if (restOption === undefined) return true;
				if (option.nameLocalisation != null && restOption.name_localizations == null) return true;
				if (option.nameLocalisation == null && restOption.name_localizations != null) return true;
				if ((option.nameLocalisation !== restOption.name_localizations) && option.nameLocalisation != null && restOption.name_localizations != null) {
					const keys = Object.entries(Locale).filter(([, value]) => typeof value === "string").map(([, value]) => value);
					for (const key of keys) {
						if (option.nameLocalisation![key] !== restOption.name_localizations[key]) {
							console.log(option.nameLocalisation![key], restOption.name_localizations[key])
							return true;
						}
					}
				}
				if (option.descriptionLocalisation != null && restOption.description_localizations == null) return true;
				if (option.descriptionLocalisation == null && restOption.description_localizations != null) return true;
				if ((option.descriptionLocalisation !== restOption.description_localizations) && option.descriptionLocalisation != null && restOption.description_localizations != null) {
					const keys = Object.entries(Locale).filter(([, value]) => typeof value === "string").map(([, value]) => value);
					for (const key of keys) {
						if (option.descriptionLocalisation![key] !== restOption.description_localizations[key]) {
							console.log(option.descriptionLocalisation![key], restOption.description_localizations[key])
							return true;
						}
					}
				}
			}
			return false;
		}
		const isPermissionsChanged = (interaction: BaseSlashCommand, restInteraction: any): boolean => {
			return interaction.getPermissionValue().toString() != restInteraction.default_member_permissions;
		}

		const isOptionsChanged = (interaction: BaseSlashCommand, restInteraction: any): boolean => {
			if (interaction.getOptions().length > 0 && restInteraction.options === undefined) return true;
			if (interaction.getOptions().length === 0 && restInteraction.options !== undefined && interaction.getOptionsSub() === undefined) return true;
			if (restInteraction.options !== undefined) {
				if (interaction.getOptionsSub() !== undefined && (interaction.getOptionsSub()!.length === restInteraction.options.length)) {
					return isSubCommandsChanged(interaction, restInteraction);
				}
			}
			if (restInteraction.options !== undefined && interaction.getOptions().length !== restInteraction.options.length) return true;
			for (const option of interaction.getOptions()) {
				const restOption = restInteraction.options.find((o: any) => o.name === option.name);
				if (restOption === undefined) return true;
				if (option.description !== restOption.description) return true;
				if (option.type !== restOption.type) return true;
				if (option.autocomplete !== restOption.autocomplete) return true;
				if (option.required != restOption.required && (option.required === true && !restOption.required)) {
					return true;
				}
				if (option.choices == undefined && restOption.choices == undefined) continue 
				if (option.choices == undefined) return true;
				if (option.choices.length > 0 && restOption.choices === undefined) return true;
				if (option.choices.length !== restOption.choices.length) return true;
				for (const choice of option.choices) {
					const restChoice = restOption.choices.find((c: any) => c.name === choice.name);
					if (restChoice === undefined) return true;
					if (choice.value !== restChoice.value) return true;
					if (choice.name !== restChoice.name) return true;
				}
			}
			return false;
		}

		const isSubCommandsChanged = (interaction: BaseSlashCommand, restInteraction: any): boolean => {
			if (interaction.getOptionsSub() !== undefined && interaction.getOptionsSub()!.length !== restInteraction.options.length) return true;
			for (const option of interaction.getOptionsSub() || []) {
				const restOption = restInteraction.options.find((o: any) => o.name === option.name);
				if (restOption === undefined) return true;
				if (option.description !== restOption.description) return true;
				if (option.type !== restOption.type) return true;
				const subCommandStatus = false;
				if (option.type === 1) {
					const subCommand = interaction.getSubCommands().find((s: any) => s.name === option.name);
					if (subCommand === undefined) return true;
					if (isOptionsChanged(subCommand, restOption)) {
						return true;
					}
				}
				if (subCommandStatus) return true;
				if (option.type === 2) {
					const subCommandGroup = interaction.getSubCommandsGroups().find((s: any) => s.name === option.name);
					if (subCommandGroup === undefined) return true;
					if (isOptionsChanged(subCommandGroup, restOption)) {
						return true;
					}
				}
				if (subCommandStatus) return true;
			}
			return false;
		}
			

		if (restInteraction === undefined) return 1;
		if (interaction.getDescription() !== restInteraction.description) return 2;
		if (isLocalizationsChanged(interaction, restInteraction)) return 3;
		if (isPermissionsChanged(interaction, restInteraction)) return 4;
		if (isOptionsChanged(interaction, restInteraction)) return 5;
		if (interaction.getPermissionValue().toString() != restInteraction.default_member_permissions) return 6;
		return 0;
	}

	/**
	 * @description Execute the command
	 * @param {string} commandName Command name
	 * @param {Client} client Discord Client
	 * @param {Message} message Discord Message
	 * @param {string[]} args Command arguments
	 * @example
	 * // runs the ping command
	 * module.runCommand('ping', client, message, args);
	 * @example
	 * // runs the ping command with the argument 'test'
	 * module.runCommand('ping', client, message, ['test']);
	 */
	public executeCommand(commandName: string, client: any, message: any, args: string[]): void {
		const command = this.commands.get(commandName) || this.aliases.get(commandName);
		if (!command) return;
		try {
			command.execute(client, message, args);
		} catch (error) {
			console.error(error);
			message.reply("there was an error trying to execute that command!");
		}
	}
}