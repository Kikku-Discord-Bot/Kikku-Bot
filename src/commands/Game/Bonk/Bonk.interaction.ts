import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import https = require("https");
import { Exception } from "@src/structures/exception/exception.class";
import { Logger, LoggerEnum } from "@src/structures/logger/logger.class";

/**
 * @description Bonk slash command
 * @class Pong
 * @extends BaseSlashCommand
 */
export class BonkSlashCommand extends BaseSlashCommand {
	constructor() {
		super("bonk", "Bonk someone",
			[
				{
					name: "user",
					description: "The user to bonk",
					type: SlashCommandOptionType.USER,
					required: true
				}
			],
			0, true, []);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const { TENOR_API_KEY } = client.getKeys();
		const userOption = interaction.options.getUser("user");
        
		if (!userOption) {
			await interaction.reply({content: "Please provide a user to bonk.", ephemeral: true});
			Logger.logToFile(`${interaction.user.username}(${interaction.user.id}) No user provided`, LoggerEnum.INFO);
			return;
		}

		if (!TENOR_API_KEY) {
			await interaction.reply({content: "Tenor API is not configured. Please contact the bot owner.", ephemeral: true});
			Logger.logToFile(`${interaction.user.username}(${interaction.user.id}) Tenor API is not configured`, LoggerEnum.INFO);
			return;
		}

		const limit = 20;
		const query = "bonk anime";
		const url = `https://tenor.googleapis.com/v2/search?q=${query}&key=${TENOR_API_KEY}&limit=${limit}`;

		const response = await new Promise((resolve, reject) => {
			https.get(url, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					resolve(data);
				});
			}).on("error", (err) => {
				reject(err);
			});
		}) as string;

		if (!response) {
			await interaction.reply({content: "Something went wrong. Please try again later.", ephemeral: true});
			Logger.logToFile(`${interaction.user.username}(${interaction.user.id}) No response from Tenor API`, LoggerEnum.INFO);
			return;
		}
		const json = JSON.parse(response);
		if (json.error) {
			Exception.logToFile(json.error, true, {name: interaction.user.username, id: interaction.user.id});
			throw new Error(json.error);
		}
		const index = Math.floor(Math.random() * limit);

		let gif = "";
		try {
			gif = json.results[index].media_formats.gif.url
		} catch (error: unknown) {
			if (error instanceof Error) {
				Exception.logToFile(error, true, {name: interaction.user.username, id: interaction.user.id});
				throw new Error("No gif found");
			}
		}
		
		try {
			await interaction.reply({
				content: `${userOption} got bonked by ${interaction.user}!`,
				//content: `${userOption} got bonked by ${interaction.user}!\n${gif}`,
				files: [gif]
			});
		} catch (error: unknown) {
			if (error instanceof Error) {
				Exception.logToFile(error, true, {name: interaction.user.username, id: interaction.user.id});
				throw new Error("Failed to reply to interaction with gif");
			}
		}
	}
}
