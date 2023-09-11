import { BaseInteraction, BaseEvent, BaseClient } from "@src/structures";
import { Exception } from "@src/structures/exception/exception.class";
import { Events, Interaction } from "discord.js"

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
		if (!interaction.isCommand()) return;
		for (const module of client.getModules().values()) {
			if (module.getInteractions().size == 0) continue;
			if (!module.getInteractions().has(interaction.commandName)) continue;
			const command: BaseInteraction | undefined = module.getInteractions().get(interaction.commandName);
			if (!command) continue;
			try {
				await command.execute(client, interaction);
			} catch (error: unknown) {
				if (error instanceof Error)
					Exception.logToFile(error, true);
				if (!interaction) return;
				if (interaction.replied) return;
				if (interaction.deferred) await interaction.editReply({ content: "There was an error while executing this command!"});
			}
		}
	}
}