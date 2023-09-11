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
		super("kick", "Kick a member", [
			{
				name: "member",
				description: "The member to kick",
				required: true,
				type: SlashCommandOptionType.USER
			},
			{
				name: "reason",
				description: "The reason for the kick",
				required: false,
				type: SlashCommandOptionType.STRING
			}
		], 0, true, [PermissionFlagsBits.KickMembers]);
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

		const reason = reasonOption?.value as string;
		if (member.id == client.user?.id) {
			await interaction.reply({content: "I won't kick myself! BLEH !", ephemeral: true});
			return;
		}
		if (!member.kickable) {
			await interaction.reply({content: `I can't kick ${member}! (Maybe he has a higher role than me ?)`, ephemeral: true});
			return;
		}
		await interaction.reply({embeds: [this.createEmbed(author, member, reason)]});
		//await member.kick(reason);
		GuildDB?.removeUserFromGuild(member.id);
	}

	createEmbed(author: GuildMember, target: GuildMember, reason: string) : EmbedBuilder {
		const embed = new EmbedBuilder()
			.setDescription(`**Member Kicked**\n\n**Name:** ${target.user.tag}\n**Id:** ${target.user.id}`)
			.setColor(Colors.DarkGrey)
			.setImage(target.user.avatarURL())
			.setAuthor({name: `Kicked by ${author.user.username}`, iconURL: `${author.user.avatarURL()}`})
			.setTimestamp(new Date())
			.setFooter({text: `${author.user.tag}`, iconURL: `${author.user.avatarURL()}`})
		if (reason)
			embed.addFields({name: "Reason", value: reason});
		return embed;
	}
}
