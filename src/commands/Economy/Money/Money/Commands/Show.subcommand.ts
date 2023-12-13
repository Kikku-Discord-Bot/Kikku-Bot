import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Show slash command
 * @class ShowSlashCommand
 * @extends BaseSlashCommand
 */
export class ShowSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "show",
			description: "Show money of a bank account",
            descriptionLocalisation: {
                fr: "Montre l'argent d'un compte bancaire"
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
                    name: "private",
                    description: "Show the money in private",
                    descriptionLocalisation: {
                        fr: "Montre l'argent en privé"
                    },
                    type: SlashCommandOptionType.BOOLEAN,
                    required: false,
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
        const privateShow = interaction.options.getBoolean("private", false) || true;

        const balance = await BankHandler.getBalance(user.id, interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("Balance")
            .setDescription(`**${user.username}** has ${balance} money`)
            .setColor(Colors.Green)

        if (!balance) {
            embed.setColor(Colors.Red)
                .setDescription(`The account of ${user} doesn't exist`)
                .setTitle("Account doesn't exist");
        }

        await interaction.reply({
            embeds: [
                embed
            ],
            ephemeral: privateShow
        });
    }
}