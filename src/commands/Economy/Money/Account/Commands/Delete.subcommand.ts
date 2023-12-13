import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Delete slash command
 * @class DeleteSlashCommand
 * @extends BaseSlashCommand
 */
export class DeleteSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "delete",
			description: "Delete a bank account",
            descriptionLocalisation: {
                fr: "Supprime un compte bancaire"
            },
            options: [
                {
                    name: "user",
                    description: "The user",
                    descriptionLocalisation: {
                        fr: "L'utilisateur"
                    },
                    type: SlashCommandOptionType.USER,
                    required: true,
                }
            ]
        })
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guild) {
            throw new Error("Guild not found");
        }

        const user = interaction.options.getUser("user", true);
        
        const account = await BankHandler.deleteAccount(user.id, interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("Account deleted")
            .setDescription(`The account of ${user} has been deleted`)
            .setColor(Colors.Green);
        
        if (!account) {
            embed.setColor(Colors.Red)
                .setDescription(`The account of ${user} doesn't exist`)
                .setTitle("Account doesn't exist");
        }

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
}