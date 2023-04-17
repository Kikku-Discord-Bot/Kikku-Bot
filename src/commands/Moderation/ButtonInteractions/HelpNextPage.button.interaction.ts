import { BaseClient, BaseInteraction } from '@src/structures';
import { ButtonInteraction, MessageEditOptions } from 'discord.js';
import { HelpSlashCommand } from '../Help.interaction';

/**
 * @description HelpNextPage button interaction
 * @class HelpNextPageButtonInteraction
 * @extends BaseInteraction
 */
export class HelpNextPageButtonInteraction extends BaseInteraction {
    constructor() {
        super('helpnextpage', 'Go to the next page of the help menu');
    }

    /**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
        const message = await interaction.fetchReply();
        const embed = message.embeds[1];
        const pageIndex = embed.footer?.text?.split(' of ')[0].split(' ')[1].split('/')[0];
        const moduleName = embed.footer?.text?.split(' of ')[1].split(' ')[3];
        
        if (pageIndex && moduleName) {
            const newPageIndex = parseInt(pageIndex) + 1;
            await interaction.editReply(HelpSlashCommand.optionsHelpCommandEmbed(client, moduleName, newPageIndex));
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
}
