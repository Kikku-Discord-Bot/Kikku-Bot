import dotenv from "dotenv";
import { GatewayIntentBits, Partials, REST } from "discord.js";
import { BaseClient } from "@src/structures";
import { DBConnection, tableSynchronisation } from "kikku-database-middleware";
import { Logger, LoggerTypeEnum } from "./structures/logger/logger.class";
import "modules.kikku.config.json"
import "./i18n/config";
import fs from "fs";

dotenv.config();

const config ={
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.AutoModerationExecution,
	],
	partials: [
		Partials.Channel, 
		Partials.GuildMember,
		Partials.Message, 
		Partials.User,
		Partials.Reaction
	],
	allowedMentions: { parse: ["users", "roles", "everyone"], repliedUser: true },
}

async function main() {
	DBConnection.getInstance().sequelize.authenticate().then(async () => {
		if (!process.env.DISCORD_BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is not defined in .env");
		if (!process.env.DISCORD_BOT_PREFIX) throw new Error("DISCORD_BOT_PREFIX is not defined in .env");
		if (!process.env.DISCORD_BOT_APP_ID) throw new Error("DISCORD_BOT_APP_ID is not defined in .env");
		Logger.log(LoggerTypeEnum.INFO, "Bot is starting...");
		const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
		const baseClient = new BaseClient(config, process.env.DISCORD_BOT_PREFIX, process.env.DISCORD_BOT_APP_ID, rest, process.env.AUTHOR_ID);
		// Load keys

		Logger.log(LoggerTypeEnum.INFO, "Synchronizing database...")
		await tableSynchronisation();

		Logger.log(LoggerTypeEnum.INFO, "Loading keys for commands...")
		baseClient.loadKeys(process.env);
		Logger.log(LoggerTypeEnum.INFO, "Loading modules config...")
		if (!process.env.MODULES_FOLDER) throw new Error("MODULES_FOLDER is not defined in .env");
		let configModules = [];
		try {
			// read config file
			configModules = JSON.parse(await fs.promises.readFile("modules.kikku.config.json", "utf8"));
		} catch {
			Logger.log(LoggerTypeEnum.WARN, "No config file found, skipping..., if you want to use config file, please create a file named modules.kikku.config.json in the root folder of the bot.")
		}
		Logger.log(LoggerTypeEnum.INFO, "Adding modules...")
		await baseClient.loadModules(process.env.MODULES_FOLDER, configModules);
		Logger.log(LoggerTypeEnum.INFO, "Loading modules commands...")
		await baseClient.loadModulesCommands();
		// Load events
		Logger.log(LoggerTypeEnum.INFO, "Loading events...")
		await baseClient.loadEvents();
		Logger.log(LoggerTypeEnum.INFO, "Bot is ready!");
		await baseClient.run(process.env.DISCORD_BOT_TOKEN);
	}).catch((err) => {
		console.error(err);
	});
}

main();