import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle, ChatInputCommandInteraction, 
	TextChannel, Message, MessageCreateOptions, User, OverwriteResolvable} from "discord.js";
import { EmbedBuilder } from "discord.js";
import { BaseClient } from "@src/structures";
import { TicketHandler  } from "../database/handler/ticket.handler.class";
import buildTranscript from "./transcript/transcript"

export class Ticket {
	private id: string;
	private channel: TextChannel;
	private owner: string;
	private isBeingDeleted = false;
	private isDeleted = false;
	private isClosed = false;
	private messageEmbed: Message<boolean> | null = null;
	private permissions: Array<OverwriteResolvable>;
	private TicketHandler: TicketHandler | null = null;
	private ticketPanelId: string;

	constructor(channel: TextChannel, owner: string, permissions: Array<OverwriteResolvable>, ticketPanelId = "") {
		this.id = channel.id;
		this.channel = channel;
		this.messageEmbed = null;
		this.owner = owner;
		this.permissions = permissions;
		this.ticketPanelId = ticketPanelId;

		(async () => {
			this.TicketHandler = await TicketHandler.getTicketById(channel.id);
			if (!this.TicketHandler) {
				console.log("Ticket not found, creating new ticket");
				this.messageEmbed = await channel.send(this.optionsTicketCommandEmbed(this.isClosed))
				this.TicketHandler = await TicketHandler.createTicket(channel.id, owner, permissions, this.messageEmbed.id, ticketPanelId);
				this.TicketHandler?.addTicketToGuild(channel.guild.id);
				this.TicketHandler?.addTicketToUser(owner);
				return;
			} else {
				this.messageEmbed = await channel.messages.fetch(this.TicketHandler.embedMessage);
			}
		})();
	}

	public getTicketPanelId(): string {
		return this.ticketPanelId;
	}

	public setIsBeingDeleted(isBeingDeleted: boolean) {
		this.isBeingDeleted = isBeingDeleted;
	}

	public async isTicketChannel(channelId: string): Promise<boolean> {
		return this.id === channelId;
	}

	public async addUser(user: User) {
		
		await this.channel.permissionOverwrites.edit(user, {
			SendMessages: true,
			ViewChannel: true,
		});

		this.TicketHandler?.addTicketToUser(user.id);
		this.channel.send(`Added ${`<@${user.id}>`} to the ticket!`);
		
	}

	public async removeUser(user: User) {
		await this.channel.permissionOverwrites.edit(user, {
			SendMessages: false,
			ViewChannel: false,
		});

		this.TicketHandler?.removeTicketOfUser(user.id);
		this.channel.send(`Removed ${`<@${user.id}>`} from the ticket!`);
	}

	public async openTicket(interaction: ChatInputCommandInteraction, client: BaseClient) {
		const channel = client.channels.cache.get(this.id) as TextChannel;
		if (!channel) {
			await interaction.reply("Ticket could not be opened!");
			return;
		}

		if (!interaction.guild)
			throw new Error("Guild is null");

		if (!this.TicketHandler)
			throw new Error("TicketHandler is null");

		await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
			SendMessages: true,
		});

		this.isClosed = false;
		let isChanged = false;

		this.TicketHandler?.permissions.find((permission) => {
			if (!interaction.guild)
				throw new Error("Guild is null");
			if (permission.id === interaction.guild.roles.everyone.id) {
				permission.allow = ["SendMessages"]
				permission.deny = ["ViewChannel"]
				isChanged = true;
			}
		});

		if (!isChanged) {
			this.TicketHandler.permissions.push({
				id: interaction.guild.roles.everyone.id,
				allow: ["SendMessages"],
				deny: ["ViewChannel"]
			});
		}

		
		if (this.messageEmbed) {
			await this.messageEmbed.delete();
			this.messageEmbed = await channel.send(this.optionsTicketCommandEmbed(this.isClosed));
			this.TicketHandler.embedMessage = this.messageEmbed.id;
		}

		this.TicketHandler.save();

		interaction.reply("Ticket Open!");
		setTimeout(() => {
			interaction.deleteReply();
		}, 3000);
	}

	public async closeTicket(interaction: ChatInputCommandInteraction, client: BaseClient) {
		const channel = client.channels.cache.get(this.id) as TextChannel;
		if (!channel) {
			await interaction.reply("Ticket could not be closed!");
			return;
		}

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		if (!this.TicketHandler) {
			throw new Error("TicketHandler is null");
		}

		await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
			SendMessages: false,
		});

		let isChanged = false;

		this.TicketHandler.permissions.find((permission) => {
			if (!interaction.guild)
				throw new Error("Guild is null");
			if (permission.id === interaction.guild.roles.everyone.id) {
				permission.deny = ["ViewChannel", "SendMessages"]
				permission.allow = []
				isChanged = true;
			}
		});

		if (!isChanged) {
			this.TicketHandler.permissions.push({
				id: interaction.guild.roles.everyone.id,
				deny: ["ViewChannel", "SendMessages"],
				allow: []
			});
		}

		this.isClosed = true;

		console.log(this.messageEmbed)

		if (this.messageEmbed) {
			await this.messageEmbed.delete();
			this.messageEmbed = await channel.send(this.optionsTicketCommandEmbed(this.isClosed));
			this.TicketHandler.embedMessage = this.messageEmbed.id;
		}

		this.TicketHandler.save();


		interaction.reply("Ticket closed!");
		setTimeout(() => {
			interaction.deleteReply();
		}, 3000);
	}
			

	public async deleteTicket(interaction: ChatInputCommandInteraction) {
		await interaction.reply("Ticket will be deleted in 10 seconds");
		const channel = interaction.channel;
		if (!channel) {
			await interaction.editReply("Ticket could not be deleted!");
			return;
		}

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketcanceldelete")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
			);
		const sendMessage = await channel.send({ content : "'You can cancel the deletion of the ticket by clicking on the button below'", components: [row] });

		this.isBeingDeleted = true;
		let i = 9;
		const interval = setInterval(async () => {
			try {
				if (this.isDeleted) {
					if (interaction.channel && this.TicketHandler) {
						await interaction.channel.delete();
						this.TicketHandler.delete();
						clearInterval(interval);
					} else {
						await interaction.editReply("Ticket could not be deleted!");
						clearInterval(interval);
						return;
					}
					return;
				}
				if (!this.isBeingDeleted) {
					await sendMessage.edit({ content: "Delete canceled (This message will deleted soon)", components: [] });
					await interaction.deleteReply();
					setTimeout(() => {
						sendMessage.delete()
					}, 3000);
					clearInterval(interval);
					return;
				}
				if (i > 0 && this.isBeingDeleted)
					await interaction.editReply(`Ticket will be deleted in ${i} seconds`);
				i--;
				if (i < 0 && this.isBeingDeleted) {
					await interaction.editReply("Ticket deleted!");
					if (interaction.channel) {
						this.isDeleted = true;
					} else {
						await interaction.editReply("Ticket could not be deleted!");
					}
				}
			} catch (e) {
				console.log(e);
			}
		}, 1000);
	}

	public async buildTranscript(guildId: string, client: BaseClient) {
		const channel = client.channels.cache.get(this.id) as TextChannel;
		if (!channel) {
			return;
		}
		return await buildTranscript(guildId, client, channel);
	}


	private optionsTicketCommandEmbed(isClosed: boolean): MessageCreateOptions {
		console.log(isClosed);
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(isClosed ? "ticketopen" : "ticketclose")
					.setLabel(isClosed ? "Open Ticket" : "Close Ticket")
					.setStyle(ButtonStyle.Secondary)
					.setEmoji({
						name: isClosed ? "🔓" : "🔒",
					}),
				new ButtonBuilder()
					.setCustomId("ticketsave")
					.setLabel("Save Transcript")
					.setStyle(ButtonStyle.Primary)
					.setEmoji({
						name: "💾",
					}),
				new ButtonBuilder()
					.setCustomId("ticketdelete")
					.setLabel("Delete Ticket")
					.setStyle(ButtonStyle.Danger)
					.setEmoji({
						name: "🗑️",
					}),
			);
					
		
		const embed = new EmbedBuilder()
			.setColor("#0099ff")
			.setTitle("Ticket Options")
			.setDescription("Choose an option")
			.setTimestamp()
			.setFooter({
				text: "Ticket Options",
			})
		return {embeds: [embed], components: [row] };
	}
}