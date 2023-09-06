import { BaseCommand, BaseClient} from "@src/structures";
import { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { Message } from "discord.js";

/**
 * @description TicketCreate command
 * @class TicketCreate
 * @extends BaseCommand
 */
export class EventCreateCommand extends BaseCommand {
	constructor() {
		super("eventset", ["es"], "Create an event", "Events", 0, true, []);
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */

	async execute(client: BaseClient, message: Message, args: string[]): Promise<void> {
		const { ENV } = client.getKeys();

        const embed = new EmbedBuilder()
               .setTitle("Event")
               .setDescription("Create an event")
               .setColor(Colors.DarkButNotBlack)
               .setTimestamp(new Date())
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                        new StringSelectMenuBuilder()
                                .setCustomId("eventset")
                                .setPlaceholder("Select an option")
                                .addOptions([
                                        {
                                                label: "Create",
                                                value: "create",
                                                description: "Create an event",
                                                emoji: "📅"
                                        },
                                        {
                                                label: "Edit",
                                                value: "edit",
                                                description: "Edit an event",
                                                emoji: "📝"
                                        },
                                        {
                                                label: "Delete",
                                                value: "delete",
                                                description: "Delete an event",
                                                emoji: "🗑️"
                                        },
                                    ])
                );

        if (ENV !== "dev") return;

        console.log(args);

        message.channel.send({ embeds: [embed], components: [row] });



        // message.guild?.scheduledEvents.create({
        //     name: "Test",
        //     scheduledStartTime: 1684838886006,
        //     description: "test",
        //     channel: "1110513265764732988",
        //     privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        //     entityType: GuildScheduledEventEntityType.Voice,
        // })
	}

}
