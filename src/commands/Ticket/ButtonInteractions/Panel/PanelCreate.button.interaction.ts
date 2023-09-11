import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, EmbedBuilder, Colors, ActionRowBuilder , ButtonBuilder, ButtonStyle } from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { Exception } from "@src/structures/exception/exception.class";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelCreateInteraction extends BaseInteraction {
	constructor() {
		super("ticketpanelcreate", "Create a ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		if (!await PanelCreateInteraction.dbUpdate(interaction)) {
			throw new Exception("An error occurred while creating your panel ticket");
		}
        
		if (!interaction.guild) {
			throw new Error("Guild is null");
			return;
		}
		const panel = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (!panel) {  
			throw new Exception("An error occurred while creating your panel ticket");
		}

		const embed = new EmbedBuilder()
			.setTitle("Step 1/5 - Set your panel name and description")
			.setDescription("Click the button below to setup a ticket panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()
            
		const embed2 = new EmbedBuilder()
			.setTitle("Panel Name")
			.setDescription(panel.name ? `\`\`\`${panel.name}\`\`\`` : "```...```")

        
		const embed3 = new EmbedBuilder()
			.setTitle("Panel Description")
			.setDescription(panel.description ? `\`\`\`${panel.description}\`\`\`` : "```...```")
            

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangename")
					.setLabel("Edit Name")
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId("panelchangedescription")
					.setLabel("Edit Description")
					.setStyle(ButtonStyle.Secondary),
			);
        
		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketsetup")
					.setLabel("Back")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("ticketpanelrole")
					.setLabel("Save & Next")
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.deferUpdate();
		await interaction.editReply({embeds: [embed, embed2, embed3], components: [row, row2]});
	}

	public static async dbUpdate(interaction: ButtonInteraction): Promise<boolean> {
		const userId = interaction.user.id;
		if (!interaction.guild) return false;
		const guildId = interaction.guild.id;

		try {
			const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(userId, guildId);
			if (!panelTicket || panelTicket.status !== PanelTicketEnum.DRAFT) {
				const newPanelTicket = await PanelTicketHandler.createPanelTicket(userId, guildId, "New Panel");
				if (!newPanelTicket) return false;
			}
		} catch (error: unknown) {
			if (error instanceof Error)
				throw new Exception(error.message);
			throw new Exception("Couldn't create the panel ticket!");
		}
		
		return true;
	}
}
