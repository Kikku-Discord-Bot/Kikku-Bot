import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, Colors, DiscordAPIError } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";
import { Exception } from "@src/structures/exception/Exception.class";

/**
 * @description Unmute slash command
 * @class Unmute
 * @extends BaseSlashCommand
 */
export class UnmuteSlashCommand extends BaseSlashCommand {
	constructor() {
		super('unmute', 'Unmute a member', [
            {
                name: 'member',
                description: 'The member to unmute',
                required: true,
                type: SlashCommandOptionType.USER
            },
            {
                name: 'reason',
                description: 'The reason for the unmute',
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
        const memberOption = interaction.options.get('member')
        const reasonOption = interaction.options.get('reason')
        const guildDB = await GuildHandler.getGuildById(interaction.guild!.id);

        if (!memberOption) {
            await interaction.reply('Something went wrong!');
            return;
        };
        
        const member = memberOption.member;

        if (!member || !interaction.guild) {
            await interaction.reply('Something went wrong!');
            return;
        };

        if (!(member instanceof GuildMember)) {
            await interaction.reply('Something went wrong!');
            return;
        };
        if (!member.isCommunicationDisabled()) {
            await interaction.reply({content: 'This member is not muted! Did you mean another member?', ephemeral: true});
            return;
        };

        try {
            if (reasonOption) {
                const reason = reasonOption.value as string;
                if (reason) {
                    await member.timeout(null, reason);
                } else {
                    await member.timeout(null);
                };
            } else {
                await member.timeout(null);
            }
        } catch (err: DiscordAPIError | any) {
            await interaction.reply({content: 'Something went wrong!', ephemeral: true});
            new Exception(err).logError();
            return;
        }
        await interaction.reply({embeds: [this.createEmbed(interaction.member as GuildMember, member, reasonOption ? reasonOption?.value as string : "")]});
	}

    createEmbed(author: GuildMember, target: GuildMember, reason: string) : EmbedBuilder {
        const embed = new EmbedBuilder()
            .setDescription(`Unmuted ${target}!`)
            .setColor(Colors.DarkGrey)
            .setTimestamp(new Date())
            .setFooter({text: `Unmuted by ${author.user.tag}`, iconURL: `${author.user.avatarURL()}`})
        if (reason && reason !== "")
            embed.addFields({name: 'Reason', value: reason});
        return embed;
    }
}
