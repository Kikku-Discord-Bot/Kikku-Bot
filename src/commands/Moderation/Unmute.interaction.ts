import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";

/**
 * @description Unmute slash command
 * @class Unmute
 * @extends BaseSlashCommand
 */
export class UnmuteSlashCommand extends BaseSlashCommand {
	constructor() {
		super("unmute", "Unmute a member", [
			{
				name: "member",
				description: "The member to unmute",
				required: true,
				type: SlashCommandOptionType.USER
			},
			{
				name: "reason",
				description: "The reason for the unmute",
				required: false,
				type: SlashCommandOptionType.STRING
			}
		], 0, true, [PermissionFlagsBits.MuteMembers]);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const memberOption = interaction.options.get("member")

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const guildDB = await GuildHandler.getGuildById(interaction.guild.id);

		if (!memberOption) {
			throw new Error("Member option is null");
		}
        
		const member = memberOption.member;

		if (!member) {
			throw new Error("Member is null");
		}

		if (!(member instanceof GuildMember)) {
			throw new Error("Member is not a GuildMember");
		}

		const role = interaction.guild.roles.cache.find(r => r.name === "Muted");

		if (!role) {
			await interaction.reply("This server does not have a muted role!");
			return;
		}

		if (!member.roles.cache.has(role.id)) {
			await interaction.reply("This member is not muted!");
			return;
		}

		await member.roles.remove(role);
		if (guildDB?.memberRoleId) {
			const memberRole = interaction.guild.roles.cache.get(guildDB.memberRoleId);
			if (memberRole && !member.roles.cache.has(memberRole.id)) await member.roles.add(memberRole);
		}
		await interaction.reply(`Successfully unmuted ${member}`);

	}
}
