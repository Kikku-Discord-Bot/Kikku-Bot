import { BaseInteraction, BaseEvent, BaseClient } from "@src/structures";
import { Base, Events, Interaction } from "discord.js"

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
			const command: BaseInteraction = module.getInteractions().get(interaction.commandName)!;
			if (!command) continue;
			try {
				await command.execute(client, interaction);
			} catch (error) {
				console.error(error);
				if (!interaction.isRepliable()) return; 
				if (interaction.deferred || interaction.replied) {
					await interaction.editReply({ content: "There was an error while executing this command!"});
				} else {
					await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
				}
			}
		}
	}
}