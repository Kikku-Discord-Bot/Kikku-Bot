import { ChatInputCommandInteraction, GuildMember, Role, PermissionFlagsBits} from "discord.js";
import { BaseClient, BaseSlashCommand, SlashCommandOptionType } from "@src/structures";

/**
 * @description SetRole command
 * @class SetRole
 * @extends BaseCommand
 * @method execute - Executes the command
 */
export class addRoleCommand extends BaseSlashCommand {
	constructor() {
		super("role", "Role action", [
			{
				name: "action",
				description: "The action to perform",
				required: true,
				type: SlashCommandOptionType.STRING,
				choices: [
					{
						name: "add",
						value: "add"
					},
					{
						name: "remove",
						value: "remove"
					}
				]
			},
			{
				name: "member",
				description: "The member to add the role to",
				required: true,
				type: SlashCommandOptionType.USER
			},
			{
				name: "role",
				description: "The role to add",
				required: true,
				type: SlashCommandOptionType.ROLE
			}
		], 0, true, [PermissionFlagsBits.ManageRoles]);
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @param {string[]} args
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const memberOption = interaction.options.get("member");
		const roleOption = interaction.options.get("role");
		const actionOption = interaction.options.get("action");

		if (!memberOption || !roleOption || !actionOption) {
			throw new Error("Member, role or action option is null");
		}

		const member = memberOption.member;
		const role = roleOption.role;
		const action = actionOption.value as string;

		if (!member || !role || !action) {
			throw new Error("Member, role or action is null");
		}

		if (!(member instanceof GuildMember) || !(role instanceof Role)) {
			throw new Error("Member or role is not a GuildMember or Role");
		}

		if (action === "remove") {
			await member.roles.remove(role);
			await interaction.reply(`Removed role ${role} from ${member}!`);
		} else {
			await member.roles.add(role);
			await interaction.reply(`Added role ${role} to ${member}!`);
		}
	}
}