/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseCommand, BaseInteraction, BaseClient, BaseSlashCommand } from "@src/structures";
import { Routes } from "discord.js";
import fs from "fs";
import { Exception } from "../exception/exception.class";

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
	// May need to change this to a Collection<string, BaseCommand> if we want to add more properties to the commands same goes the aliases
	// private commands: Collection<string, BaseCommand> = new Collection();
	private commands: Map<string, BaseCommand> = new Map(); 

	/**
	 * @description Creates a new module
	 * @param name 
	 * @param isEnabled 
	 */
	constructor(name: string, description?: string, isEnabled?: boolean) {
		this.name = name;
		this.description = description || "No description provided";
		this.enabled = isEnabled || true;
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
		const toRegister = [];
		const registered = [];
		let hasChanged = false;
		for (const [, interaction] of this.interactions) {
			if (!(interaction instanceof BaseSlashCommand)) continue;
			registered.push(interaction.getName());
			const match = alreadyAdded.find(i => i.name === interaction.getName());
			/*console.log("--------------------")
			console.log("Match", match)
			console.log("--------------------")*/
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
			console.log("Interaction not found");
			break;
		case 2:
			console.log("Description changed");
			break;
		case 3:
			console.log("Options added");
			break;
		case 4:
			console.log("Options removed");
			break;
		case 5:
			console.log("Option added");
			break;
		case 6:
			console.log("Option description changed");
			break;
		case 7:
			console.log("Option type changed");
			break;
		case 8:
			console.log("Option required changed");
			break;
		case 9:
			console.log("Option choices changed");
			break;
		case 10:
			console.log("Option choices added (10)");
			break;
		case 11:
			console.log("Option choices added (11)");
			break;
		case 12:
			console.log("Option choice added (12)");
			break;
		case 13:
			console.log("Option choice value changed");
			break;
		case 14:
			console.log("Permission changed");
		}
		return index != 0;
	}

	private isChanged(interaction: BaseSlashCommand, restInteraction: any): number {
		if (restInteraction === undefined) return 1;
		if (interaction.getDescription() !== restInteraction.description) return 2;
		if (interaction.getOptions().length > 0 && restInteraction.options === undefined) return 3;
		if (restInteraction.options && interaction.getOptions().length !== restInteraction.options.length) return 4;
		if (interaction.getPermissionValue().toString() != restInteraction.default_member_permissions) return 14;
		for (const option of interaction.getOptions()) {
			const restOption = restInteraction.options.find((o: any) => o.name === option.name);
			if (restOption === undefined) return 5;
			if (option.description !== restOption.description) return 6;
			if (option.type !== restOption.type) return 7;
			if (option.required !== restOption.required && (option.required != false && restOption.required != undefined)) return 8;
			if (option.choices == undefined && restOption.choices == undefined) {continue}
			if (option.choices.length > 0 && restOption.choices === undefined) return 10;
			if (option.choices.length !== restOption.choices.length) return 11;
			for (const choice of option.choices) {
				const restChoice = restOption.choices.find((c: any) => c.name === choice.name);
				if (restChoice === undefined) return 12;
				if (choice.value !== restChoice.value) return 13;
			}
		}
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