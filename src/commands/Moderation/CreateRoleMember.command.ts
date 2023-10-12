import { Colors, Message } from "discord.js";
import { BaseCommand, BaseClient } from "@src/structures";
import { PermissionsBitField } from "discord.js";
import { GuildHandler } from "@src/structures/database/handler/guild.handler.class";


/**
 * @description CreateRoleMember command
 * @class CreateRoleMember
 * @extends BaseCommand
 * @method execute - Executes the command
 */
export class CreateRoleMemberCommand extends BaseCommand {
	constructor() {
		super({
			name: "createrolemember", 
			aliases: ["createrm"], 
			description: "Create a role member", 
		});
	}


	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, message: Message, args: string[]): Promise<void> {
		if (args.length == 0) {
			message.reply("Please provide a role name").then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 5000);
			});
			return;
		}

		const roleName = args.join(" ");
		const guild = message.guild;
		if (!guild) {
			message.reply("Guild not found").then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 5000);
			});
			return;
		}
		const role = message.guild.roles.cache.find((r) => r.name === roleName);
		if (role) {
			message.reply("Role already exists").then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 5000);
			});
			return;
		} else {
			const permissions = new PermissionsBitField();
			permissions.add("SendMessages");
			const role = await guild.roles.create({
				name: roleName,
				color: Colors.Blue,
				mentionable: true,
				permissions: permissions
			});
			if (!role) {
				message.reply({ content: "Couldn't create role"}).then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 5000);
				});
				return;
			}
			const guildDB = await GuildHandler.getGuildById(guild.id);
			if (!guildDB) {
				message.reply({ content: "Guild not found but role created, you'll need to delete it"}).then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 5000);
				});
				return;
			}
			const status = await guildDB.updateMemberRoleId(role.id);
			if (!status) {
				message.reply({ content: "Something went wrong"}).then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 5000);
				});
				return;
			}
			message.reply(`Role ${roleName} created`);
		}
	}
}
