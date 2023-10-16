import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, Embed, EmbedBuilder } from "discord.js";
import { Jikan } from "./Utils/Jikan.class.handler";
import { WaifuModule } from "@src/modules/Waifu.module";

/**
 * @description Open the main menu
 * @class DateSlashCommand
 * @extends BaseSlashCommand
 */
export class DateSlashCommand extends BaseSlashCommand {
	constructor() {
		super({
			name: "date",
			description: "Find a date",
			descriptionLocalisation: {
				fr: "Trouve un rendez-vous"
			},
		});
	}


	/**
     * @description Executes the slash command
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const waifuPossible = [
			{
				"name": "Nikishigi Chisato",
				"rank": "SSR",
			},
			{
				"name": "Yuuki Asuna",
				"rank": "SSR",
			},
			{
				"name": "Yukino Yukinoshita",
				"rank": "UR",
			},
			{
				"name": "Emilia",
				"rank": "UR",
			}
		]


		const waifu = waifuPossible[Math.floor(Math.random() * waifuPossible.length)];
		const jikanResults = await Jikan.instance.getCharactersSearch(waifu.name);
		if (!jikanResults || !jikanResults.pagination ||!jikanResults.pagination.items || jikanResults.pagination.items.total === 0) {
			interaction.reply({
				content: "I can't find this waifu",
				ephemeral: true
			})
			return
		}
		const jikanResult = jikanResults.data[0];
		const dbHandler = WaifuModule.get(client).getDatabaseHandler();
		const dbWaifu = await dbHandler.getOneRowUser(interaction.user.id, {waifu: jikanResult.name});
		if (!dbWaifu) {
			await dbHandler.createRowUser(interaction.user.id,
				{
					waifu: jikanResult.name,
					rank: waifu.rank,
				}
			)
			const embed = new EmbedBuilder()
				.setColor(Colors.Purple) // TODO: Change color based on rank
				.setTitle(jikanResult.name + " (" + jikanResult.name_kanji + ")")
				.setDescription(jikanResult.about)
				.setImage(jikanResult.images.webp.image_url)
				.setFooter({text: jikanResult.url, iconURL: jikanResult.images.webp.image_url})

			await interaction.reply({
				embeds: [embed]
			})
		} else {
			const noNewWaifuEmbed = new EmbedBuilder()
				.setColor(Colors.Gold)
				.setTitle("You already have that waifu")
				.setDescription(JSON.stringify(dbWaifu))

			await interaction.reply({
				embeds: [noNewWaifuEmbed]
			})
		}
	}
}
