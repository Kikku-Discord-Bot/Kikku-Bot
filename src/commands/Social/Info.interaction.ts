import { BaseSlashCommand, BaseClient } from "@src/structures";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { SlashCommandOptionType } from "@src/structures";
import { PermissionFlagsBits } from "discord.js";
import { UserHandler } from "@src/structures/database/handler/user.handler.class";
import * as Canvas from "canvas"
import exp from "constants";

/**
 * @description Info slash command
 * @class Info
 * @extends BaseSlashCommand
 */
export class InfoSlashCommand extends BaseSlashCommand {
	constructor() {
		super({
            name: "info", 
            description: "info of a member",
            options: [
                {
                    name: "member",
                    description: "The member to unmute",
                    type: SlashCommandOptionType.USER
                },
		    ]}
        );
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
        let user = interaction.user;

        if (memberOption && memberOption.user) {
            user = memberOption.user;
        }

        if (!exps || !interaction.guild) {
            await interaction.reply("Something went wrong!");
            return;
        }

        
        const userLevel = this.getLevel(exps.user);
        const guildLevel = this.getLevel(exps.guild);
        const embed = new EmbedBuilder()
            .setTitle("Info")
            .setDescription(`Here is the info of ${user.tag}`)
            .addFields(
                { name: "User Level", value: userLevel.toString(), inline: true },
                { name: "User Experience", value: exps.user.toString(), inline: false },
                { name: "Guild Level", value: guildLevel.toString(), inline: true },
                { name: "Guild Experience", value: exps.guild.toString(), inline: false },
            )
            .setColor(Colors.Orange)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        //await interaction.deferReply();
        await interaction.reply({files: [await this.createImage({level: userLevel, exp: exps.user}, {level: guildLevel, exp: exps.guild})]});
        //embeds: [embed], 
	}

    getLevel(experience: number, level: number = 1): number {
        let exponent = 1.5;
        let baseExp = 100;
        experience -= Math.floor(baseExp * (Math.pow(level + 1, exponent)));
        if (experience < 0) {
            return level;
        } else {
            return this.getLevel(experience, level + 1);
        }
    }

    needExp(level: number): number {
        let exponent = 1.5;
        let baseExp = 100;
        return Math.floor(baseExp * (Math.pow(level + 1, exponent)));
    }

    levelExp(level: number): number {
        let exponent = 1.5;
        let baseExp = 100;
        return Math.floor(baseExp * (Math.pow(level, exponent)));
    }

    remainingExp(level: number, exp: number): number {
        return this.needExp(level) - exp;
    }

    remainingExpPourcentage(level: number, exp: number): number {
        return Math.floor((exp / level) * 100);
    }

    createImage(user: { level: number, exp: number }, guild: { level: number, exp: number }): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const width = 600;
            const height = 300;
            Canvas.registerFont("./src/assets/fonts/Roboto-Regular.ttf", { family: "Roboto" });
            const canvas = Canvas.createCanvas(width, height);
            const ctx = canvas.getContext("2d");
            const background = await Canvas.loadImage("https://wallpapercave.com/wp/wp11318817.jpg");
            
            console.log(this.remainingExpPourcentage(user.level, user.exp));
            console.log(this.remainingExpPourcentage(guild.level, guild.exp));

            ctx.drawImage(background, 0, 0, width, height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(15, 15, width - 30, height - 30);
            
            ctx.font = "28px Roboto";
            ctx.fillStyle = "#ffff";
            ctx.fillText(`Guild Level: ${guild.level}`, 15, 50);
            // replace experience with exp bar
            ctx.fillText(`Experience: ${this.remainingExpPourcentage(guild.level, guild.exp)}%`, 30, 80);

            ctx.fillText(`Global Level: ${user.level}`, 15, 200);
            // replace experience with exp bar
            ctx.fillText(`Experience: ${this.remainingExpPourcentage(user.level, user.exp)}%`, 30, 230);
            const buffer = canvas.toBuffer("image/png");
            resolve(buffer);
        });
    }
}
