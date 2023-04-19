import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, DiscordAPIError, Colors, GuildMember, PermissionsBitField, EmbedBuilder, Guild } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { Exception } from "@src/structures/exception/Exception.class";

/**
 * @description Mute slash command
 * @class Mute
 * @extends BaseSlashCommand
 */
export class MuteSlashCommand extends BaseSlashCommand {
	constructor() {
		super('mute', 'Mute a member', [
            {
                name: 'member',
                description: 'The member to mute',
                required: true,
                type: SlashCommandOptionType.USER
            },
            {
                name: 'time',
                description: 'The time to mute the member',
                required: true,
                type: SlashCommandOptionType.INTEGER
            },
            {
                name: 'reason',
                description: 'The reason for the mute',
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
        const timeOption = interaction.options.get('time')
        const reasonOption = interaction.options.get('reason')
        const author = interaction.member as GuildMember;

        if (!memberOption || !timeOption) {
            await interaction.reply('Something went wrong!');
            return;
        };
        
        const member = memberOption.member;
        const time = timeOption.value as number;

        if (!member || !time || !interaction.guild) {
            await interaction.reply('Something went wrong!');
            return;
        };

        if (!(member instanceof GuildMember)) {
            await interaction.reply('Something went wrong!');
            return;
        };

        if (member.isCommunicationDisabled()) {
            await interaction.reply({ content: 'This member is already muted! Did you mean another member?', ephemeral: true});
            return;
        };

        try {
            console.log("LOL")
            if (reasonOption && typeof reasonOption.value !== 'string') {
                const reason = reasonOption!.value as unknown as string;
                await member.timeout(time * 1000, reason);
            } else {
                await member.timeout(time * 1000, 'No reason provided');
            };   
        } catch (err: DiscordAPIError | any) {
            await interaction.reply({content: 'Something went wrong!', ephemeral: true});
            new Exception(err).logError();
            return;
        } 
        await interaction.reply({embeds: [this.createEmbed(author, member, time, reasonOption?.value as string)]});
	}

    createEmbed(author: GuildMember, target: GuildMember, time: number, reason: string) : EmbedBuilder {
        const embed = new EmbedBuilder()
            .setDescription(`Muted ${target} for ${time} seconds!`)
            .setColor(Colors.DarkGrey)
            .setTimestamp(new Date())
            .setFooter({text: `Muted by ${author.user.tag}`, iconURL: `${author.user.avatarURL()}`})
        if (reason)
            embed.addFields({name: 'Reason', value: reason});
        return embed;
    }
}
