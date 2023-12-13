import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Leaderboard slash command
 * @class LeaderboardSlashCommand
 * @extends BaseSlashCommand
 */
export class LeaderboardSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "leaderboard",
			description: "Money leaderboard",
            descriptionLocalisation: {
                fr: "Classement de l'argent"
            },
            options: [
                {
                    name: "position",
                    description: "The position to display",
                    descriptionLocalisation: {
                        fr: "La position à afficher"
                    },
                    type: SlashCommandOptionType.INTEGER,
                    required: false,
                }
            ]
        })
	}


    /**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     *  
     * @returns {Promise<void>}
     */
    async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guildId) throw new Error("Guild ID not found");

		let accounts = await BankHandler.getMembersBalanceByGuild(interaction.guildId);

		accounts = accounts.sort((a, b) => {
			return b.balance - a.balance;
		})

		accounts = accounts.slice(0, 10);

		const getEmoji = (place: number) => {
			switch (place) {
				case 1:
					return "🥇";
				case 2:
					return "🥈";
				case 3:
					return "🥉";
				default:
					return `#${place}`
			}	
		}

		const embed = new EmbedBuilder()
			.setTitle("Classement des plus gros comptes bancaires")
			.setColor(Colors.Gold)
			.setTimestamp()
			.setDescription(
				accounts.map((account, index) => {
					return `${getEmoji(index + 1)}. <@${account.fkUser}> - ${account.balance} money`
				}).join("\n")
			)
			

        await interaction.reply({
            embeds: [
				embed
            ],              
        });
    }
}
