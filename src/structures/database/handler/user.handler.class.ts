import { GuildUserModel } from "../models/guild.db.model";
import { UserModel } from "../models/user.db.model";

export class UserHandler {
	private _id = "";
	private _username = "";
	
	public get id(): string {
		return this._id;
	}

	public get username(): string {
		return this._username;
	}

	public static async getUserById(id: string): Promise<UserHandler | null> {
		const user = new UserHandler();
		const userDB = await UserModel.findOne({ where: { id: id } });
		if (!userDB) { return null; }
		user._id = userDB.get("id") as string;
		user._username = userDB.get("username") as string;
		return user;
	}

	public static async getUserByUsername(username: string): Promise<UserHandler | null> {
		const user = new UserHandler();
		const userDB = await UserModel.findOne({ where: { username: username } });
		if (!userDB) { return null; }
		user._id = userDB.get("id") as string;
		user._username = userDB.get("username") as string;
		return user;
	}

	public static async createUser(id: string, username: string): Promise<UserHandler | null> {
		const user = new UserHandler();
		const userDB = await UserModel.create({ id: id, username: username });
		if (!userDB) { return null; }
		user._id = userDB.get("id") as string;
		user._username = userDB.get("username") as string;
		return user;
	}

	public static async deleteUser(id: string): Promise<boolean> {
		const userDB = await UserModel.destroy({ where: { id: id } });
		if (!userDB) { return false; }
		return true;
	}

	public static async addExperience(experience: number, id: string, guildId: string): Promise<boolean> {
		const userDB = await UserModel.increment("experience", { by: experience, where: { id: id } });
		const guildUserDB = await GuildUserModel.increment("experience", { by: experience, where: { fkUser: id, fkGuild: guildId } });
		if (!userDB || !guildUserDB) { return false; }
		return true;
	}

	public static async removeExperience(experience: number, id: string, guildId: string): Promise<boolean> {
		const userDB = await UserModel.decrement("experience", { by: experience, where: { id: id } });
		const guildUserDB = await GuildUserModel.decrement("experience", { by: experience, where: { fkUser: id, fkGuild: guildId } });
		if (!userDB || !guildUserDB) { return false; }
		return true;
	}

	public static async getExperience(id: string, guildId: string | undefined = undefined): Promise<{ user: number, guild: number}> {
		let userExp = 0;
		let guildUserExp = 0;
		const userDB = await UserModel.findOne({ where: { id: id } });
		if (userDB) { 
			userExp = userDB.get("experience") as number;
		}
		if (guildId) {
			const guildUserDB = await GuildUserModel.findOne({ where: { fkUser: id, fkGuild: guildId } });
			if (guildUserDB) { 
				guildUserExp = guildUserDB.get("experience") as number;
			}
		}
		return { user: userExp, guild: guildUserExp}
	}
		
}