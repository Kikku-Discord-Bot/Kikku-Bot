/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, REST } from "discord.js";
import { BaseModule } from "@src/structures";
import eventLoader from "@events/loader"
import * as fs from "fs";

/**
 * @description Base class for client
 * @category BaseClass
 */


interface BaseClientInfo {
	prefix: string;
	authorId?: string;
	modules: Map<string, BaseModule>;
}


export class BaseClient extends Client {

	private prefix: string;
	private modules: Map<string, BaseModule> = new Map();
	private clientId: string;
	private baseRest: REST;
	private authorId?: string;
	private keys: { [key: string]: string | undefined } = {};

	constructor(config: any, prefix: string, clientId: string, rest: REST, authorId?: string) {
		super(config);
		this.prefix = prefix;
		this.clientId = clientId;
		this.baseRest = rest;
		this.authorId = authorId;
	}

	/**
	 * @description Returns the modules of the client
	 * @returns {Map<string, BaseModule>}
	 * @example
	 * // returns the modules of the client
	 * client.getModules();
	 */
	public getModules(): Map<string, BaseModule> {
		return this.modules;
	}

	/**
	 * @description Returns a module of the client
	 * @param {string} name
	 * @returns {BaseModule}
	 * @example
	 * // returns a module of the client
	 * client.getModule("Game");
	 * @throws {Error} If the module is not found
	 * @throws {Error} If the module name is not a string
	 */
	public getModule(name: string): BaseModule {
		if (typeof name !== "string") throw new Error(`The module name ${name} is not a string`);
		const module = this.modules.get(name);
		if (!module) throw new Error(`The module ${name} is not found`);
		return module;
	}

	/**
	 * @description Returns the author id
	 * @returns {string}
	 * @example
	 * // returns the author id
	 * client.getAuthorId();
	 * @throws {Error} If the author id is not set
	 */
	public getAuthorId(): string {
		if (!this.authorId) throw new Error("The author id is not set");
		return this.authorId;
	}

	/**
	 * @description Returns the client id
	 * @returns {string}
	 */
	public getClientId(): string {
		return this.clientId;
	}

	/**
	 * @description Returns the prefix of the client
	 * @returns {string}
	 */
	public getBaseRest(): REST {
		return this.baseRest;
	}

	/**
	 * @description Add a module to the client
	 * @param {BaseModule} module
	 * @example
	 * // add a module to the client
	 * client.addModule(module);
	 * @returns {void}
	 * @throws {Error} If the module already exists
	 * @throws {Error} If the module is not an instance of BaseModule
	 */
	public addModule(module: BaseModule): void {
		if (this.modules.has(module.getName())) throw new Error(`The module ${module.getName()} already exists`);
		if (!(module instanceof BaseModule)) throw new Error(`The module ${module} is not an instance of BaseModule`);
		this.modules.set(module.getName(), module);
	}

	/**
	 * @description Add multiple modules to the client
	 * @param {BaseModule[]} modules
	 * @example
	 * // add multiple modules to the client
	 * client.addModules([module1, module2]);
	 * @returns {void}
	 * @throws {Error} If the module already exists
	 * @throws {Error} If the module is not an instance of BaseModule
	 * @throws {Error} If the modules is not an array
	 * @throws {Error} If the modules is empty
	 */
	public addModules(modules: BaseModule[]): void {
		if (!Array.isArray(modules)) throw new Error(`The modules ${modules} is not an array`);
		if (modules.length == 0) throw new Error(`The modules ${modules} is empty`);
		modules.forEach((module: BaseModule) => {
			this.addModule(module);
		});
	}


	/**
	 * @description Load the modules of the client
	 * @returns {Promise<void>}
	 * @example
	 * // load the modules of the client
	 * client.loadModules();
	 * @throws {Error} If the module is not an instance of BaseModule
	 * @throws {Error} If the module name is not a string
	 * @throws {Error} If the module already exists
	 */
	async loadModules(path: string, options: {name: string, isActive: boolean}[] = []): Promise<void> {
		const modulesFiles = await fs.promises.readdir(path);
		for (const file of modulesFiles) {
			const lstat = await fs.promises.lstat(`${path}/${file}`);
			if (!file.endsWith(".module.ts") || !lstat.isFile()) continue;
			const module = await import(`${path}/${file}`);
			try {
				new module[Object.keys(module)[0]]();
			} catch {
				console.log(`The module ${file} is not an instance of BaseModule, skipping...`);
				continue;
			}
			const moduleInstance = new module[Object.keys(module)[0]]();
			if (!(moduleInstance instanceof BaseModule)) 
				throw new Error(`The module ${moduleInstance} is not an instance of BaseModule`);
			if (this.modules.has(moduleInstance.getName()))
				throw new Error(`The module ${moduleInstance.getName()} already exists`);
			const option = options.find((option) => option.name === moduleInstance.getName());
			if (option && option.isActive === false) {
				console.log(`The module ${moduleInstance.getName()} is not active, skipping...`);
				continue
			}
			console.log(`Module ${moduleInstance.getName()} added`);
			this.modules.set(moduleInstance.getName(), moduleInstance);
		}
	}

	
	/**
	 * @description Load the commands of the modules of the client
	 * @returns {Promise<void>}
	 * @example
	 * // load the commands of the  modules of the client
	 * client.loadModules();
	 */
	async loadModulesCommands(): Promise<void> {
		let restSlashCommands = await this.baseRest.get(
			`/applications/${this.clientId}/commands?with_localizations=true`,
		) as any[];
		let hasChanged = false;
		const registeredSlashCommand = [];
		//console.log(restSlashCommands);
	
		for (const module of this.modules.values()) {
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			console.log("Loading", module.getName(), "...");
			if (hasChanged) {
				//console.log(restSlashCommands);
				restSlashCommands = await this.baseRest.get(
					`/applications/${this.clientId}/commands?with_localizations=true`,
				) as any[];
			}


			await module.loadCommands("src/commands" + "/" + module.getName());
			await module.loadSlashCommands("src/commands" + "/" + module.getName());
			const result = await module.registerSlashCommands(this, restSlashCommands);
			for (const slashCommand of result.registered) {
				registeredSlashCommand.push(slashCommand);
			}
			hasChanged = result.hasChanged;
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		}

		for (const slashCommand of restSlashCommands) {
			if (!registeredSlashCommand.includes(slashCommand.name)) {
				console.log("Deleting", slashCommand.name, "...");
				await this.baseRest.delete(
					`/applications/${this.clientId}/commands/${slashCommand.id}`,
				);
			}
		}
		
	}
	
	/**
	 * @description Load the events of the client
	 * @returns {Promise<void>}
	 * @example
	 * // load the events of the client
	 * client.loadEvents();
	 */
	async loadEvents(): Promise<void> {
		await eventLoader(this);
	}

	/**
	 * @description Run the client
	 * @param {string} token
	 * @returns {Promise<void>}
	 * @example
	 * // run the client
	 * client.run('token');
	 */
	async run(token: string): Promise<void> {
		await this.login(token);
		console.log("Bot started");
	}

	/**
	 * @description Returns the prefix of the client
	 * @returns {string}
	 */
	public getPrefix(): string {
		return this.prefix;
	}

	/**
	 * @description Returns information about the client
	 * @returns {BaseClientInfo}
	 */

	public getInfo(): BaseClientInfo {
		return {
			prefix: this.prefix,
			modules: this.modules,
			authorId: this.authorId
		};
	}

	/**
	 * @description Returns the keys of the client
	 * @returns {{ [key: string]: string | undefined }}
	 * @example
	 * // returns the keys of the client
	 * client.getKeys();
	 * @throws {Error} If the keys are not set
	 * @throws {Error} If the keys is not an array
	 */
	public getKeys(): { [key: string]: string | undefined } {
		if (!this.keys) throw new Error("The keys are not set");
		return this.keys;
	}

	/**
	 * @description Load the keys of the client
	 * @param {{ [key: string]: string | undefined }} keys
	 * @returns {void}
	 */
	public loadKeys(keys: { [key: string]: string | undefined }): void {
		this.keys = keys;
	}
}
