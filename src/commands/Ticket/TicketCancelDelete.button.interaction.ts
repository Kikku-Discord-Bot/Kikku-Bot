import { BaseClient, BaseInteraction } from '@src/structures';
import { TicketManager } from '@src/structures/utils/ticketManager.class';
import { time } from 'console';
import { ChatInputCommandInteraction } from 'discord.js';

/**
 * @description TicketCancelDelete button interaction
 * @class TicketCancelDeleteButtonInteraction
 * @extends BaseButtonInteraction
 */
export class TicketCancelDeleteButtonInteraction extends BaseInteraction {
    constructor() {
        super('ticketcanceldelete', 'Delete a ticket');
    }

    /**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guildId) {
            await interaction.reply('This command can only be used in a server');
            return;
        }
        if (!interaction.channelId) {
            await interaction.reply('This command can only be used in a channel, if you are in a ticket, try again discord may have not updated the channel id yet');
            return;
        }
        TicketManager.getInstance().cancelDeleteTicket(interaction.channelId, client);
        await interaction.reply('Ticket deletion cancelled');
        await interaction.deleteReply();
    }
}
