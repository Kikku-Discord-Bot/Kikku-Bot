import dotenv from "dotenv";
import { GatewayIntentBits, Partials, REST } from "discord.js";
import { BaseClient } from "@src/structures";
import { GameModule } from "./modules/Game.module";
import databaseSynchronisation from "./structures/database/sync.db";
import { DBConnection } from "./structures/database/dbConnection.db.class";
import { TicketModule } from "./modules/Ticket.module";
import { ModerationModule } from "./modules/Moderation.module";
import { WaifuModule } from "./modules/Waifu.module";
import "./i18n/config";

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
		console.log("Starting bot...");
		const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
		const baseClient = new BaseClient(config, process.env.DISCORD_BOT_PREFIX, process.env.DISCORD_BOT_APP_ID, rest, process.env.AUTHOR_ID);
		console.log("Adding modules...");
		baseClient.addModules([
			new GameModule(),
			new WaifuModule()
			//new TicketModule(),
			//new ModerationModule(),
		]);
		console.log("Synchronising database...");
		await databaseSynchronisation(baseClient);
		console.log("Loading modules...");
		await baseClient.loadModules();
		// Load keys
		console.log("Loading keys for commands...");
		await baseClient.loadKeys(process.env);
		// Load events
		console.log("Loading events...");
		await baseClient.loadEvents();
		console.log("Bot is ready!");
		await baseClient.run(process.env.DISCORD_BOT_TOKEN);
	}).catch((err) => {
		console.error(err);
	});
}

main();