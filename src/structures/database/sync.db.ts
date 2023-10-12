import { DBConnection } from "./dbConnection.db.class";
import { GuildModel, GuildUserModel } from "./models/guild.db.model";
import { UserModel } from "./models/user.db.model";
import { BaseClient } from "../base/BaseClient.class";

export default async function databaseSynchronisation(client: BaseClient): Promise<void> {
	const sequelize = DBConnection.getInstance().sequelize;
	
	console.log("Synchronising basic models...");
	await GuildModel.sync();
	await UserModel.sync();
	await GuildUserModel.sync();
	console.log("Synchronising modules models...");
	await client.syncModels();
	console.log("Synchronising database...");
	

	await sequelize.sync();
}