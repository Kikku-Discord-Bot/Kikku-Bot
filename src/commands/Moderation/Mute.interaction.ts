import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, Colors, GuildMember, PermissionsBitField, EmbedBuilder } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";

/**
 * @description Mute slash command
 * @class Mute
 * @extends BaseSlashCommand
 */
export class MuteSlashCommand extends BaseSlashCommand {
	constructor() {
		super("mute", "Mute a member", [
			{
				name: "member",
				description: "The member to mute",
				required: true,
				type: SlashCommandOptionType.USER
			},
			{
				name: "time",
				description: "The time to mute the member",
				required: true,
				type: SlashCommandOptionType.INTEGER
			},
			{
				name: "reason",
				description: "The reason for the mute",
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
		const timeOption = interaction.options.get("time")
		const reasonOption = interaction.options.get("reason")
		const author = interaction.member as GuildMember;

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const GuildDB = await GuildHandler.getGuildById(interaction.guild.id);

		if (!GuildDB) {
			throw new Error("GuildDB is null");
		}

		if (!timeOption) {
			throw new Error("Time option is null");
		}

		if (!memberOption) {
			throw new Error("Member option is null");
		}
        
		const member = memberOption.member;
		const time = timeOption.value as number;

		if (!member || !time) {
			throw new Error(`Member or time is null, member: ${member}, time: ${time}`);
		}

		if (!(member instanceof GuildMember)) {
			throw new Error("Member is not a GuildMember");
		}
        
		const role = interaction.guild.roles.cache.find(role => role.name === "Muted");
		const memberRoleSetup = GuildDB.memberRoleId;
		const roleMember = interaction.guild.roles.cache.find(role => role.id === GuildDB.memberRoleId);
		if (!role) {
			if (!memberRoleSetup || !roleMember) {
				const permissions = new PermissionsBitField();
				permissions.remove(PermissionFlagsBits.SendMessages);
				interaction.guild.roles.create({
					name: "Muted",
					color: Colors.DarkGrey,
					permissions: []
				}).then(async role => {
					await member.roles.add(role);
					setTimeout(async () => {
						if (member.roles.cache.has(role.id))
							await member.roles.remove(role);
					}, time * 1000);
				});
			} else {
				const permissions = new PermissionsBitField();
				permissions.remove(PermissionFlagsBits.SendMessages);
				interaction.guild.roles.create({
					name: "Muted",
					color: Colors.DarkGrey,
					permissions: []
				}).then(async role => {
					await member.roles.remove(GuildDB.memberRoleId);
					await member.roles.add(role);
					setTimeout(async () => {
						if (member.roles.cache.has(role.id))
							await member.roles.remove(role);
						if (!member.roles.cache.has(GuildDB.memberRoleId))
							await member.roles.add(GuildDB.memberRoleId);
					}, time * 1000);
				});
			}
		} else {
			if (!memberRoleSetup || !roleMember) {
				await member.roles.add(role);
				setTimeout(async () => {
					if (member.roles.cache.has(role.id))
						await member.roles.remove(role);
				}, time * 1000);
			} else {
				await member.roles.add(role);
				await member.roles.remove(GuildDB.memberRoleId);
				setTimeout(async () => {
					if (member.roles.cache.has(role.id))
						await member.roles.remove(role);
					if (!member.roles.cache.has(GuildDB.memberRoleId))
						await member.roles.add(GuildDB.memberRoleId);
				}, time * 1000);
			}
		}
		const everyoneRole = interaction.guild.roles.everyone;
		if (everyoneRole.permissions.has(PermissionFlagsBits.SendMessages)) {
			await interaction.reply({embeds: [this.createEmbed(author, member, time, false, reasonOption?.value as string)]});
		} else {
			await interaction.reply({embeds: [this.createEmbed(author, member, time, true, reasonOption?.value as string)]});
		}
	}

	createEmbed(author: GuildMember, target: GuildMember, time: number, isUseful: boolean, reason: string) : EmbedBuilder {
		const embed = new EmbedBuilder()
			.setDescription(isUseful ? `Muted ${target} for ${time} seconds!` : `(Not) Muted ${target} for ${time} seconds!
            (Everyone role has send messages permission, so the member can still send messages)
            You can fix this by removing the send messages permission from the everyone role!
            And then ask Kikku to create a member role! New members will get this role!`)
			.setColor(Colors.DarkGrey)
			.setTimestamp(new Date())
			.setFooter({text: `Muted by ${author.user.tag}`, iconURL: `${author.user.avatarURL()}`})
		if (reason)
			embed.addFields({name: "Reason", value: reason});
		return embed;
	}
}
