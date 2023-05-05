import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { UserHandler } from "@src/structures/database/handler/user.handler.class";
import * as Canvas from "canvas"
import {PassThrough} from "stream"
import exp from "constants";

/**
 * @description Info slash command
 * @class Info
 * @extends BaseSlashCommand
 */
export class InfoSlashCommand extends BaseSlashCommand {
	constructor() {
		super("info", "info of a member", [
			{
				name: "member",
				description: "The member to unmute",
				type: SlashCommandOptionType.USER
			},
		], 0, true, []);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const memberOption = interaction.options.get("member")
        let exps = { user: 0, guild: 0}
        if (!memberOption) {
		    exps = await UserHandler.getExperience(interaction.user.id, interaction.guild!.id);
        } else {
            if (!(memberOption instanceof GuildMember)) {
                await interaction.reply("Something went wrong!");
                return;
            }
            exps = await UserHandler.getExperience(memberOption.user.id, interaction.guild!.id);
        }

        if (!exps || !interaction.guild) {
            await interaction.reply("Something went wrong!");
            return;
        }
        const userLevel = this.getLevel(exps.user);
        const guildLevel = this.getLevel(exps.guild);
        const embed = new EmbedBuilder()
            .setTitle("Info")
            .setDescription(`Here is the info of ${memberOption?.user.tag || interaction.user.tag}`)
            .addFields(
                { name: "User Level", value: userLevel.toString(), inline: true },
                { name: "User Experience", value: exps.user.toString(), inline: false },
                { name: "Guild Level", value: guildLevel.toString(), inline: true },
                { name: "Guild Experience", value: exps.guild.toString(), inline: false },
            )
            .setColor(Colors.Orange)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        
        await interaction.reply({ embeds: [embed], files: [await this.createImage(userLevel, exps.user)]});       
	}

    getLevel(experience: number): number {
        return Math.floor(0.1 * Math.sqrt(experience) + 1);
    }


    createImage(level: number, experience: number): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const width = 500;
            const height = 200;
            const canvas = Canvas.createCanvas(width, height);
            const ctx = canvas.getContext("2d");
            
            const background = await Canvas.loadImage("https://wallpapercave.com/wp/wp11318817.jpg");
            ctx.drawImage(background, 0, 0, width, height);

            ctx.strokeStyle = "#74037b";
            ctx.strokeRect(0, 0, width, height);
            ctx.font = "28px sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`Level: ${level}`, width / 2.5, height / 1.8);
            ctx.fillText(`Experience: ${experience}`, width / 2.5, height / 1.5);
            const buffer = canvas.toBuffer("image/png");
            resolve(buffer);
        });
    }
}
