import { BaseInteraction, BaseEvent, BaseClient } from "@src/structures";
import { Exception } from "@src/structures/exception/exception.class";
import { Logger, LoggerTypeEnum, LoggerFileEnum } from "@src/structures/logger/logger.class";
import { Events, Interaction } from "discord.js"
import { t } from "i18next";

function getStringOptionInteraction(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;
	const subGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

	const options = interaction.options.data
	console.log(subGroup, subCommand)
	console.log(options)
	if (!options) return "";
	let resp = "";
	for (const option of options) {
		if (subCommand) {
			resp += `${subCommand}`
			if (option.options)
				for (const sub of option.options) {
					resp += `(${sub.name}: ${sub.value}, `;
				}
		} else
			resp += `${option.name}: ${option.value}, `;
	}
	if (subCommand && resp.endsWith(", ")) resp = resp.slice(0, -2) + ")";
	if (resp.endsWith(", ")) resp = resp.slice(0, -2);
	return resp;
}

/**
 * @description InteractionCreated event
 * @category Events
 * @extends BaseEvent
 */
export class InteractionCreatedEvent extends BaseEvent {
	constructor() {
		super(Events.InteractionCreate, false);
	}

	/**
	 * @description Executes the event
	 * @param {BaseClient} client
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * @override
	 */
	async execute(client: BaseClient, interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;
		for (const module of client.getModules().values()) {
			if (module.getInteractions().size == 0) continue;
			if (!module.getInteractions().has(interaction.commandName)) continue;
			const command: BaseInteraction | undefined = module.getInteractions().get(interaction.commandName);
			if (!command) continue;
			if (interaction.guildId)
				console.debug(module.isEnabled(), await module.isGuildEnabled(interaction.guildId));
			if (!module.isEnabled() || (interaction.guildId && !await module.isGuildEnabled(interaction.guildId))) {
				Logger.debug(`Command ${command.getName()} (${getStringOptionInteraction(interaction)}) was executed by ${interaction.user.tag} (${interaction.user.id}) but the module ${module.getName()} is disabled`, false, LoggerFileEnum.INFO, client);
				if (interaction.replied) {
					await interaction.editReply({ content: t("error.moduleDisabled", { module: module.getName(), user: `<@${client.getAuthorId()}>`})});
					return;
				} 
				if (interaction.deferred)
					await interaction.editReply({ content: t("error.moduleDisabled", { module: module.getName(), user: `<@${client.getAuthorId()}>`})});
				else
					await interaction.reply({ content: t("error.moduleDisabled", { module: module.getName(), user: `<@${client.getAuthorId()}>`}), ephemeral: true});
				return;
			}
			try {
				await Logger.log(LoggerTypeEnum.INFO, `Command ${command.getName()} (${getStringOptionInteraction(interaction)}) was executed by ${interaction.user.tag} (${interaction.user.id})`, true, LoggerFileEnum.INFO, client);
				await command.execute(client, interaction);
			} catch (error: unknown) {
				if (error instanceof Error)
					await Logger.log(LoggerTypeEnum.ERROR, Exception.getErrorMessageLogFormat(error.message, error.stack), true, LoggerFileEnum.INFO, client);
				if (!interaction) return;
				if (interaction.replied) {
					console.log( t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`}));
					await interaction.editReply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`})});
					return;
				} 
				if (interaction.deferred)
					await interaction.editReply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`})});
				else {
					console.log( t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`}));
					await interaction.reply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`}), ephemeral: true});
				}
			}
		}
	}
}