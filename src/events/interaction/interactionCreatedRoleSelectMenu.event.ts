import { BaseInteraction, BaseEvent, BaseClient } from "@src/structures";
import { Events, Interaction } from "discord.js"
import { Exception } from "@src/structures/exception/exception.class";
import { Logger, LoggerEnum } from "@src/structures/logger/logger.class";
import { t } from "i18next";

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
		if (!interaction.isRoleSelectMenu()) return;
		for (const module of client.getModules().values()) {
			if (module.getInteractions().size == 0) continue;
			if (!module.getInteractions().has(interaction.customId)) continue;
			const command: BaseInteraction | undefined = module.getInteractions().get(interaction.customId);
			if (!command) continue;
			try {
				await Logger.log(`Command ${command.getName()} was executed by ${interaction.user.tag} (${interaction.user.id})`, LoggerEnum.INFO, true, client);
				await command.execute(client, interaction);
			} catch (error: unknown) {
				if (error instanceof Error)
					await Logger.log(Exception.getErrorMessageLogFormat(error.message, error.stack), "error", true, client);
				if (!interaction) return;
				if (interaction.replied) await interaction.editReply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`})});
				if (interaction.deferred) await interaction.editReply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`})});
				if (!interaction.deferred) await interaction.reply({ content: t("error.command", { command: command.getName(), user: `<@${client.getAuthorId()}>`}), ephemeral: true});
			}
		}
	}
}