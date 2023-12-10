import { BaseInteraction, BaseEvent, BaseClient } from "@src/structures";
import { Events, Interaction } from "discord.js"
import { Exception } from "@src/structures/exception/exception.class";
import { Logger, LoggerTypeEnum, LoggerFileEnum } from "@src/structures/logger/logger.class";
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
		if (!interaction.isAutocomplete()) return;
		for (const module of client.getModules().values()) {
			if (module.getInteractions().size == 0) continue;
			if (!module.getInteractions().has(interaction.commandName)) continue;
			const command: BaseInteraction | undefined = module.getInteractions().get(interaction.commandName);
			if (!command) continue;
			try {
				console.log(`Command ${command.getName()} was executed by ${interaction.user.tag} (${interaction.user.id})`);
				await command.autoComplete(interaction, client);
			} catch (error: unknown) {
				if (error instanceof Error)
					await Logger.log(Exception.getErrorMessageLogFormat(error.message, error.stack), "error", true, LoggerTypeEnum.ERROR, client);

			}
		}
	}
}