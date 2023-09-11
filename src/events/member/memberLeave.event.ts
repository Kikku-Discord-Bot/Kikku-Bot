import { BaseClient, BaseEvent } from "@src/structures";
import { GuildMember, Events } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";

/**
 * @description Event for when a member leave a guild
 * @category Events
 * @extends BaseEvent
 */
export class MemberLeaveEvent extends BaseEvent {
	constructor() {
		super(Events.GuildMemberRemove);
	}

	public async execute(client: BaseClient, member: GuildMember) {
		console.log(`Member ${member.user.tag} has leaved the guild ${member.guild.name}`);

		if (member.user.bot) { return; }
		if (!member.id || !member.user.tag) { return; }

		if (!member.guild) { return; }
		const guild = await GuildHandler.getGuildById(member.guild.id);
		if (guild) {
			await guild.removeUserFromGuild(member.id);
		}
	}
}