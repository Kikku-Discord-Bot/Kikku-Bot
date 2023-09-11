import { BaseEvent, BaseClient  } from "@src/structures";
import { ActivitiesOptions, ActivityType, Events, Guild, TextChannel } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";
import { UserHandler } from "@src/structures/database/handler/user.handler.class";
import { TicketHandler } from "@src/structures/database/handler/ticket.handler.class";
import { TicketManager } from "@src/structures/tickets/ticketManager.class";

/**TicketDB
 * @description Ready event
 * @class ReadyEvent
 * @extends BaseEvent
 * @method execute - Executes the event
 */
export class ReadyEvent extends BaseEvent {
	constructor() {
		super(Events.ClientReady, false);
	}

	/**
	 * @description Executes the event
	 * @param {BaseClient} client
	 */
	async execute(client: BaseClient): Promise<void> {
		console.log(`Logged in as ${client.user?.tag}`);

		let statusIndex = 0;
		const { VERSION, BOT_NAME } = client.getKeys();
		setInterval(() => {
			const status = [`${BOT_NAME ? BOT_NAME : "?"} v${VERSION ? VERSION : "?"}`, "Developped by Serena Satella"]; // You can change the status here
			const activity = { 
				type: ActivityType.Playing, 
				name: status[statusIndex],
			} as ActivitiesOptions;
			client.user?.setPresence({
				activities: [activity],
				status: "online"
			})
			if (statusIndex < status.length - 1) statusIndex++; else statusIndex = 0;
		}, 10000);
		await this.loadingGuilds(client);
	}

	async loadingGuilds(client: BaseClient): Promise<void> {
		(await client.guilds.fetch()).forEach(clientGuild => {
			clientGuild.fetch().then(async guild => {
				console.log(`Working on: ${guild.name} with ${guild.memberCount} members`);
				if (!parseInt(guild.id) || !guild.name) { return; }
				let guildDB = await GuildHandler.getGuildById(guild.id);
				if (!guildDB) {
					console.log(`Guild ${guild.name} not found in database, creating it`);
					guildDB = await GuildHandler.createGuild(guild.id, guild.name);
					if (!guildDB) { return console.log(`Guild ${guild.name} couldn't be created`); }
					console.log(`Guild ${guild.name} created`);
				}
				await this.loadingUsers(guild, guildDB);
				await this.loadingTickets(guild, guildDB);
			});
		})
	}

	async loadingUsers(guild: Guild, guildDB: GuildHandler): Promise<void> {
		const guildMembers = await guild.members.fetch();
		const idAlreadyAdded = await guildDB.getUsers();
		for (const member of guildMembers) {
			if (member[1].user.bot) { continue; }
			if (idAlreadyAdded.find((userId) => userId === member[1].id)) { continue; }
			let userDB = await UserHandler.getUserById(member[1].id);
			if (!userDB) {
				userDB = await UserHandler.createUser(member[1].id, member[1].user.tag);
				if (!userDB) { console.log(`User ${member[1].user.tag} couldn't be created`); continue; }
			}
			await guildDB.addUserToGuild(member[1].id);
		}
	}

	async loadingTickets(guild: Guild, guildDB: GuildHandler): Promise<void> {
		console.log(`Loading tickets for guild ${guild.name}, '${guild.id}'`);
		TicketHandler.getTicketOfGuild(guildDB.id).then(async tickets => {
			if (!tickets) { return; }
			for (const ticketId of tickets) {
				const ticket = await TicketHandler.getTicketById(ticketId);
				if (!ticket) { continue; }
				let channel;
				try {
					channel = await guild.channels.fetch(ticket.id.toString());
				} catch (e) {
					console.log(`Ticket ${ticket.id} deleted`);
					await TicketHandler.deleteTicket(ticket.id);
					continue;
				}
				if (!channel || !channel.isTextBased()) { continue; }
				TicketManager.getInstance().createTicketFromDB(channel as TextChannel, ticket.owner, ticket.permissions)
				console.log(`Ticket ${ticket.id} loaded`);
			}
		});
	}
}