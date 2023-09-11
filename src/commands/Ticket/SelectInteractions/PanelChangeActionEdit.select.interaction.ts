import { BaseClient, BaseInteraction } from "@src/structures";
import { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuInteraction, RoleSelectMenuBuilder } from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelChangeActionEditSelectInteraction extends BaseInteraction {
	constructor() {
		super("panelactioneditselect", "Edit action of the ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: StringSelectMenuInteraction): Promise<void> {
		if (interaction.values.length != 1) {
			throw new Error("Interaction values length is not 1");
		}

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const panel = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id, PanelTicketEnum.EDIT);
		if (!panel) {
			throw new Error("Panel is null");
		}

		switch (interaction.values[0]) {
		case "name_description":
			await this.formatChangeNameAndDescription(client, interaction, panel);
			break;
		case "role":
			await this.formatChangeRole(client, interaction, panel);
			break;
		case "category":
			await this.formatChangeCategory(client, interaction, panel);
			break;
		case "transcript":
			await this.formatChangeTranscript(client, interaction, panel);
			break;
		case "send":
			await this.formatChangeSend(client, interaction);
			break;
		}

		if (interaction.replied) {
			return;
		}

		throw new Error("Interaction not replied");
	}

	async formatChangeNameAndDescription(client: BaseClient, interaction: StringSelectMenuInteraction, panel: PanelTicketHandler) {
		const embed = new EmbedBuilder()
			.setTitle("Change your panel name and description")
			.setDescription("Click the buttons below to update your panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const embed2 = new EmbedBuilder()
			.setTitle("Panel Name")
			.setDescription(panel.name ? panel.name : "```...```")


		const embed3 = new EmbedBuilder()
			.setTitle("Panel Description")
			.setDescription(panel.description ? panel.description : "```...```")


		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangenameedit")
					.setLabel("Edit Name")
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId("panelchangedescriptionedit")
					.setLabel("Edit Description")
					.setStyle(ButtonStyle.Secondary),
			);

		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangeeditselect")
					.setLabel("Done")
					.setStyle(ButtonStyle.Secondary),
			);


		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2, embed3], components: [row, row2] })
	}

	async formatChangeRole(client: BaseClient, interaction: StringSelectMenuInteraction, panel: PanelTicketHandler) {
		const embed = new EmbedBuilder()
			.setTitle("Change your panel role")
			.setDescription("Click the buttons below to update your panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		let stringListRoles = "No role(s) selected"
		if (panel.roles.length > 0) {
			stringListRoles = panel.roles.map((role) => `<@&${role}>\n`).join(" ");
		}

		const embed2 = new EmbedBuilder()
			.setTitle("Panel Role(s)")
			.setDescription(stringListRoles)


		const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
			.addComponents(
				new RoleSelectMenuBuilder()
					.setCustomId("panelroleedit")
					.setPlaceholder("Select a role")
					.setMinValues(0)
					.setMaxValues(10)
			);

		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangeeditselect")
					.setLabel("Done")
					.setStyle(ButtonStyle.Secondary),
			);


		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2], components: [row, row2] })
	}

	async formatChangeCategory(client: BaseClient, interaction: StringSelectMenuInteraction, panel: PanelTicketHandler) {
		const embed = new EmbedBuilder()
			.setTitle("Change your panel category")
			.setDescription("Click the buttons below to update your panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const embed2 = new EmbedBuilder()
			.setTitle("Panel Category")
			.setDescription(`<#${panel.category}>`)

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildCategory])
					.setCustomId("panelcategoryedit")
					.setPlaceholder("Select a category")
			);

		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangeeditselect")
					.setLabel("Done")
					.setStyle(ButtonStyle.Secondary),
			);

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2], components: [row, row2] })
	}

	async formatChangeTranscript(client: BaseClient, interaction: StringSelectMenuInteraction, panel: PanelTicketHandler) {
		const embed = new EmbedBuilder()
			.setTitle("Change your panel transcript channel")
			.setDescription("Click the buttons below to update your panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const embed2 = new EmbedBuilder()
			.setTitle("Transcript Channel")
			.setDescription(`<#${panel.transcriptChannel}>`)


		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildText])
					.setCustomId("paneltranscriptedit")
					.setPlaceholder("Select a transcript channel")
			);

		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangeeditselect")
					.setLabel("Done")
					.setStyle(ButtonStyle.Secondary),
			);


		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2], components: [row, row2] })
	}

	async formatChangeSend(client: BaseClient, interaction: StringSelectMenuInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("Change your panel send channel")
			.setDescription("Click the buttons below to update your panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildText])
					.setCustomId("panelsendchanneledit")
					.setPlaceholder("Select a channel")
			);

		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("panelchangeeditselect")
					.setLabel("Done")
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId("panelsendactionedit")
					.setLabel("Send")
					.setStyle(ButtonStyle.Secondary),
			);


		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed], components: [row, row2] })
	}
}
