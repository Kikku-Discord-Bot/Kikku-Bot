import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionReplyOptions } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";

/**
 * @description Help slash command
 * @class Help
 * @extends BaseSlashCommand
 */
export class HelpSlashCommand extends BaseSlashCommand {
	constructor() {
		super("help", "Get help with the bot", [
			{
				name: "command",
				description: "The command to get help with",
				required: false,
				type: SlashCommandOptionType.STRING
			} 
		], 0, true, []);
	}

	/**
     * @description Executes the slash command
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const commandOption = interaction.options.get("command")

		if (!interaction.channel) {
			await interaction.reply({content: "Something went wrong!", ephemeral: true});
			return;
		}

		if (!commandOption) {
			const response = HelpSlashCommand.optionsHelpCommandEmbed(client);
			response.ephemeral = true;
			await interaction.reply(response);
		} else {
			let command = null;

			for (const module of client.getModules().values()) {
				for (const cmd of module.getCommands().values()) {
					if (cmd.getName() === commandOption.value) {
						command = cmd;
						break;
					}
				}
			}

			if (!command) {
				await interaction.reply({content: "Something went wrong!", ephemeral: true});
				return;
			}

			const embed = new EmbedBuilder()
				.setTitle(`Help - ${command.getName()}`)
				.setColor(Colors.DarkButNotBlack)
				.setDescription(command.getDescription())
				.addFields({name: "Usage", value: `\`${command.getUsage()}\``, inline: false})
				.addFields({name: "Cooldown", value: `${command.getCooldown()} seconds`, inline: false})
				.addFields({name: "Permissions", value: `${command.getPermissions().map((permission) => `\`${permission}\``).join(", ")}`, inline: false})
				.addFields({name: "Aliases", value: `${command.getAliases().map((alias) => `\`${alias}\``).join(", ")}`, inline: false})
				.addFields({name: "NSFW", value: `${command.isNSFW() ? "Yes" : "No"}`, inline: false})


			await interaction.reply({embeds: [embed], ephemeral: true});
		}
	}

	public static getNextModule(client: BaseClient, moduleName: string): string {
		const modules = Array.from(client.getModules().keys());
		const moduleIndex = modules.indexOf(moduleName);
		if (moduleIndex === modules.length - 1) return modules[0];
		return modules[moduleIndex + 1];
	}

	public static getPreviousModule(client: BaseClient, moduleName: string): string {
		const modules = Array.from(client.getModules().keys());
		const moduleIndex = modules.indexOf(moduleName);
		if (moduleIndex === 0) return modules[modules.length - 1];
		return modules[moduleIndex - 1];
	}

	public static optionsHelpCommandEmbed(client: BaseClient, moduleName = "", pageNumber = 0, onlyPage = false): InteractionReplyOptions {
		const module = client.getModules().get(moduleName);
		if (!module) return HelpSlashCommand.optionsHelpCommandEmbed(client, client.getModules().keys().next().value, 1, false);
		const pageMax = Math.ceil(module.getCommands().size / 10);
		if (pageNumber < 1) return HelpSlashCommand.optionsHelpCommandEmbed(client, moduleName, pageMax, false);
		if (pageNumber > Math.ceil(module.getCommands().size / 10)) return HelpSlashCommand.optionsHelpCommandEmbed(client, moduleName, 1, false);
		if (pageMax === 1 && !onlyPage) return HelpSlashCommand.optionsHelpCommandEmbed(client, moduleName, 1, true);
		const moduleIndex = Array.from(client.getModules().keys()).indexOf(moduleName);
		const embed = new EmbedBuilder()
			.setTitle(module.getName())
			.setColor(Colors.DarkButNotBlack)
			.setDescription(module.getDescription())
			.setFooter({text: `Page ${pageNumber}/${pageMax} of Module ${moduleIndex + 1}/${client.getModules().size} - ${module.getName()}`})
    
		const commands = Array.from(module.getCommands().values());
		const commandsPage = commands.slice((pageNumber - 1) * 10, pageNumber * 10);
		for (const command of commandsPage) {
			embed.addFields({name: `${command.getName()} | ${command.getAliases().join(", ")}` , value: command.getDescription(), inline: false});
		}

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("helppreviousmodule")
					.setLabel("Previous Module")
					.setStyle(ButtonStyle.Primary)
					.setEmoji({
						name: "⏪"
					})
			);
		if (!onlyPage) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("helppreviouspage")
					.setLabel("Previous Page")
					.setStyle(ButtonStyle.Primary)
					.setEmoji({
						name: "⬅️"
					}),
			);
		}
		if (!onlyPage) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("helpnextpage")
					.setLabel("Next Page")
					.setStyle(ButtonStyle.Primary)
					.setEmoji({
						name: "➡️"
					})
			);
		}
		row.addComponents(
			new ButtonBuilder()
				.setCustomId("helpnextmodule")
				.setLabel("Next Module")
				.setStyle(ButtonStyle.Primary)
				.setEmoji({
					name: "⏩"
				})
		);

		const mainEmbed = new EmbedBuilder()
			.setTitle("Help")
			.setColor(Colors.DarkButNotBlack)
			.setDescription("Here is a list of all the commands you can use with the bot. You can also use the `help <command>` command to get more information about a specific command.")

		return { embeds: [mainEmbed, embed], components: [row]}
	}
}