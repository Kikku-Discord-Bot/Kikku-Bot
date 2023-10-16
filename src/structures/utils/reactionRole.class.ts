import { MessageReaction, User } from "discord.js";


export class ReactionRole {

	private static instance: ReactionRole = new ReactionRole();
	private roleMatch: Map<string, string> = new Map<string, string>();

	constructor() {
		if (ReactionRole.instance) {
			throw new Error("Error: Instantiation failed: Use ReactionRole.getInstance() instead of new.");
		}
		ReactionRole.instance = this;
		// LOAD ROLES HERE WITH DB
		this.roleMatch.set("👍", "Test");
	}

	public static getInstance(): ReactionRole {
		return ReactionRole.instance;
	}


	async addRole(reaction: MessageReaction, user: User) {
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}
		try {
			if (!reaction.emoji.name) return;
			if (this.roleMatch.has(reaction.emoji.name)) {
				this.addMemberRole(reaction, user);
			}
		} catch (error) {
			console.error("Something went wrong when adding a role: ", error);
		}
	}

	async addMemberRole(reaction: MessageReaction, user: User) {
		if (!reaction.message.guild) return;
		const member = reaction.message.guild.members.cache.get(user.id);
		if (member) {
			const role = reaction.message.guild.roles.cache.find(role => role.name === this.roleMatch.get(reaction.emoji.name ? reaction.emoji.name : ""));
			if (role && !member.roles.cache.has(role.id)) {
				await member.roles.add(role);
			}
		}
	}

	async removeRole(reaction: MessageReaction, user: User) {
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}
		try {
			if (!reaction.emoji.name) return;
			if (this.roleMatch.has(reaction.emoji.name)) {
				this.removeMemberRole(reaction, user);
			}
		} catch (error) {
			console.error("Something went wrong when adding a role: ", error);
		}
	}

	async removeMemberRole(reaction: MessageReaction, user: User) {
		if (!reaction.message.guild) return;
		const member = reaction.message.guild.members.cache.get(user.id);
		if (member) {
			const role = reaction.message.guild.roles.cache.find(role => role.name === this.roleMatch.get(reaction.emoji.name ? reaction.emoji.name : ""));
			if (role && member.roles.cache.has(role.id)) {
				await member.roles.remove(role);
			}
		}
	}
	
}

