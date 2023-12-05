import { BaseSlashCommand, BaseClient, BaseSubGroupSlashCommand, BaseSubSlashCommand, SlashCommandOptionType } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Embed, EmbedBuilder, GuildEmoji } from "discord.js";
var PokeAPI = require('pokedex-promise-v2');
import https from "https";
import fs from "fs";
/**
 * @description Enable slash command
 * @class EnableSlashCommand
 * @extends BaseSlashCommand
 */
export class EnableSlashCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "enable",
			description: "Enable a module",
			descriptionLocalisation: {
                fr: "Active un module"
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
	}

    /**
     * @description Auto complete the response
     * @param {interaction} AutocompleteInteraction
     * @returns {Promise<void>}
     * @override
     */
    async autoComplete(interaction: AutocompleteInteraction, client: BaseClient): Promise<void> {
        const focused = interaction.options.getFocused();
        const modulesList = client.getModules();
        let choices = [];
        for(const module of modulesList) {
            const key = module[0];
            const value = module[1];
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