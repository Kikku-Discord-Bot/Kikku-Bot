import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonBuilder, ButtonInteraction, Colors, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonStyle} from "discord.js";
import { PanelTicketHandler, PanelTicketEnum } from "@src/structures/database/handler/panelTicket.handler.class";
/**
 * @description PanelChangeDescription button interaction
 * @class PanelChangeDescriptionInteraction
 * @extends BaseInteraction
 */
export class PanelChangeDescriptionInteraction extends BaseInteraction {
	constructor() {
		super({name: "panelsendactionedit", description: "Send a ticket panel"});
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		if (!interaction.guildId) {
			throw new Error("Guild is null");
		} 
        
		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guildId, PanelTicketEnum.EDIT);
		if (!panelTicket) {
			throw new Error("Panel is null");
		}
        
		const channelSend = client.channels.cache.get(panelTicket.sendChannel) as TextChannel;
		if (!channelSend) {
			throw new Error("Channel is null");
		}

		let botUrl = undefined;
		if (client.user && client.user.avatarURL()) {
			botUrl = client.user.avatarURL() as string;
		}

		const embed = new EmbedBuilder()
			.setTitle(panelTicket.name)
			.setDescription(panelTicket.description)
			.setColor(Colors.Green)
			.setFooter({iconURL: botUrl, text: panelTicket.id })

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setLabel("Create Ticket")
					.setCustomId("ticketcreatepanel"),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setLabel("Refresh Panel")
					.setCustomId("ticketrefreshpanel")
			);
        
		await channelSend.send({ embeds: [embed], components: [row] });
		await interaction.reply({ content: "Panel sent", ephemeral: true });
	}
}
