import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Remove slash command
 * @class RemoveSlashCommand
 * @extends BaseSlashCommand
 */
export class RemoveSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "remove",
			description: "Remove money to a bank account",
            descriptionLocalisation: {
                fr: "Retire de l'argent à un compte bancaire"
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
                },
                {
                    name: "amount",
                    description: "The amount",
                    descriptionLocalisation: {
                        fr: "Le montant"
                    },
                    type: SlashCommandOptionType.INTEGER,
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
        const amount = interaction.options.getInteger("amount", true);
        
        const transfer = await BankHandler.removeBalance(user.id, interaction.guild.id, amount, "Admin command");

        let embed = new EmbedBuilder()
            .setTitle("Money added")
            .setDescription(`The user ${user} has been removed ${amount} money`)
            .setColor(Colors.Green);

        if (!transfer) {
            embed = new EmbedBuilder()
                .setTitle("Error")
                .setDescription(`The user ${user} has not been found or the amount is invalid`)
                .setColor(Colors.Red);
        }

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
}