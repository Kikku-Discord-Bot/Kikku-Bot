import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
import { GuildHandler } from "kikku-database-middleware";
/**
 * @description Disable slash command
 * @class DisableSlashCommand
 * @extends BaseSlashCommand
 */
export class DisableSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "disable",
			description: "Disable a module",
			descriptionLocalisation: {
                fr: "Desactive un module"
            },
            options: [
                {
                    name: "module",
                    description: "The module",
                    descriptionLocalisation: {
                        fr: "Le module"
                    },
                    type: SlashCommandOptionType.STRING,
                    required: true,
                    autocomplete: true
                }
            ]
		});
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const moduleChoice = interaction.options.getString("module", true);
        const guild = interaction.guild;
        if (!guild) return;
        const guildHandler = await GuildHandler.getGuildById(guild.id);
        if (!guildHandler) {
            throw new Error("GuildHandler not found");
        }
        const status = guildHandler.switchModule(moduleChoice, false);
        if (!status) {
            throw new Error("Module not found");
        }
        const embed = new EmbedBuilder()
            .setTitle("Module disabled")
            .setDescription(`The module ${moduleChoice} has been disabled`)
            .setColor(0x00FF00);
        await interaction.reply({
            embeds: [embed]
        });
	}

    /**
     * @description Auto complete the response
     * @param {interaction} AutocompleteInteraction
     * @returns {Promise<void>}
     * @override
     */
    async autoComplete(interaction: AutocompleteInteraction, client: BaseClient): Promise<void> {
        const focused = interaction.options.getFocused();
        const modulesList = client.getModules()
        let choices = [];
        for(const module of modulesList) {
            const key = module[0];
            const value = module[1];
            if (value.isEnabled())
                choices.push({
                    name: value.getName(),
                    value: key
                });
        }

        const filteredChoices = choices.filter((choice: any) => {
            return choice.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().startsWith(focused.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
        }).slice(0, 25);
        
        await interaction.respond(
            filteredChoices.map((choice: { name: any; value: any; }) => ({ name: choice.name, value: choice.value }))
        );
    }
}