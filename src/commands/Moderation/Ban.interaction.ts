import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, Colors, GuildMember, EmbedBuilder } from "discord.js";
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
		super("ban", "Ban a member", [
			{
				name: "member",
				description: "The member to ban",
				required: true,
				type: SlashCommandOptionType.USER
			},
			{
				name: "reason",
				description: "The reason for the ban",
				required: false,
				type: SlashCommandOptionType.STRING
			},
			{
				name: "delete_messages",
				description: "Delete messages from the member",
				required: false,
				type: SlashCommandOptionType.BOOLEAN
			},
			{
				name: "days_of_messages",
				description: "The amount of days to delete messages from, (max 7, default 7)",
				required: false,
				type: SlashCommandOptionType.INTEGER
			}
		], 0, true, [PermissionFlagsBits.BanMembers]);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const memberOption = interaction.options.get("member")
		const reasonOption = interaction.options.get("reason")
		const deleteMessagesOption = interaction.options.get("delete_messages")
		const daysOfMessagesOption = interaction.options.get("days_of_messages")
		const author = interaction.member as GuildMember;

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const GuildDB = await GuildHandler.getGuildById(interaction.guild.id);

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

		if (!member.bannable) {
			await interaction.reply({content: `I am missing permissions to ban ${member} !`, ephemeral: true});
			return;
		}

		const reason = reasonOption?.value as string;
		const deleteMessages = deleteMessagesOption?.value as boolean;
		const daysOfMessages = daysOfMessagesOption?.value as number;
		try {
			if (deleteMessages) {
				if (daysOfMessages && daysOfMessages > 0 && daysOfMessages <= 7) {
					await member.ban({reason: reason, deleteMessageSeconds: daysOfMessages * 86400});
				} else {
					if (daysOfMessages && daysOfMessages > 7) {
						await interaction.reply({content: "You can only delete messages from more than the last 7 days!", ephemeral: true});
						return;
					}
					await member.ban({reason: reason, deleteMessageDays: 7});
				}
			} else {
				await member.ban({reason: reason});
			}
			await interaction.reply({embeds: [this.createEmbed(author, member, reason)]});
			GuildDB?.removeUserFromGuild(member.id);
		} catch (error: unknown) { // Discord API error
			if ((error as { rawError: { message: string; }; }).rawError.message.includes("Missing Permissions")) {
				await interaction.reply({content: "I am missing permissions to ban this member!", ephemeral: true});
				return;
			}
		}
	}

	createEmbed(author: GuildMember, target: GuildMember, reason: string) : EmbedBuilder {
		const embed = new EmbedBuilder()
			.setDescription(`**Member Banned**\n\n**Name:** ${target.user.tag}\n**Id:** ${target.user.id}`)
			.setColor(Colors.DarkGrey)
			.setImage(target.user.avatarURL())
			.setAuthor({name: `Banned by ${author.user.username}`, iconURL: `${author.user.avatarURL()}`})
			.setTimestamp(new Date())
			.setFooter({text: `${author.user.tag}`, iconURL: `${author.user.avatarURL()}`})
		if (reason)
			embed.addFields({name: "Reason", value: reason});
		return embed;
	}
}
