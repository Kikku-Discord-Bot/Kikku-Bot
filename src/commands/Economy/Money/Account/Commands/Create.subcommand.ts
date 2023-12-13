import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { BankHandler } from "kikku-database-middleware";
/**
 * @description Create slash command
 * @class CreateSlashCommand
 * @extends BaseSlashCommand
 */
export class CreateSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "create",
			description: "Create a bank account",
            descriptionLocalisation: {
                fr: "Crée un compte bancaire"
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
                    name: "balance",
                    description: "The initial balance",
                    descriptionLocalisation: {
                        fr: "Le solde initial"
                    },
                    type: SlashCommandOptionType.INTEGER,
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
        const balance = interaction.options.getInteger("balance", false) || 0;
        
        const account = await BankHandler.createAccount(user.id, interaction.guild.id,  balance);

        const embed = new EmbedBuilder()
            .setTitle("Account created")
            .setDescription(`The account of ${user} has been created with ${balance} money`)
            .setColor(Colors.Green);

        if (!account) {
            embed.setColor(Colors.Red)
                .setTitle("Account already exists")
                .setDescription(`The account of ${user} already exists`);
        }

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
}