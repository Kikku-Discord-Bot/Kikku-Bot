import dotenv from "dotenv";
import { GatewayIntentBits, Partials, REST } from "discord.js";
import { BaseClient } from "@src/structures";
import { GameModule } from "./modules/Game.module";
import databaseSynchronisation from "./structures/database/sync.db";
import { DBConnection } from "./structures/database/dbConnection.db.class";
import { TicketModule } from "./modules/Ticket.module";
import { ModerationModule } from "./modules/Moderation.module";
import { SocialModule } from "./modules/Social.module";

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
		await databaseSynchronisation();
		console.log("Starting bot...");
		if (!process.env.DISCORD_BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is not defined in .env");
		if (!process.env.DISCORD_BOT_PREFIX) throw new Error("DISCORD_BOT_PREFIX is not defined in .env");
		if (!process.env.DISCORD_BOT_APP_ID) throw new Error("DISCORD_BOT_APP_ID is not defined in .env");
		
		const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
		const baseClient = new BaseClient(config, process.env.DISCORD_BOT_PREFIX, process.env.DISCORD_BOT_APP_ID, rest, process.env.AUTHOR_ID);
		// Load modules
		console.log("Loading modules...");
		baseClient.addModule(new GameModule());
		baseClient.addModule(new TicketModule());
		baseClient.addModule(new ModerationModule());
		baseClient.addModule(new SocialModule());
		
		await baseClient.loadModules();
		// Load keys
		console.log("Loading keys for commands...");
		baseClient.loadKeys(process.env);
		// Load events
		await baseClient.loadEvents();
		await baseClient.run(process.env.DISCORD_BOT_TOKEN);
	}).catch((err) => {
		console.error(err);
	});
}

main();