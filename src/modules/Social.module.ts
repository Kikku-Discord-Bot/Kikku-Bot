import { BaseClient, BaseModule } from "@src/structures";
import { DataTypes } from "sequelize";

export class SocialModule extends BaseModule {
	constructor() {
		super("Social", "1.0.0", true,
			{
				"user": {
					"fields": [
						{
							"name": "exp",
							"type": DataTypes.INTEGER,
							"allowNull": false,
							"defaultValue": 0
						},
						{
							"name": "level",
							"type": DataTypes.INTEGER,
							"allowNull": false,
							"defaultValue": 0
						},
						{
							"name": "coins",
							"type": DataTypes.INTEGER,
							"allowNull": false,
							"defaultValue": 0
						}
					]
				},
			}
		);
	}

	async addExperienceGlobal(userId: string,  exp: number): Promise<any> {
		const user = await this.getDatabaseHandler().getOneRowUser(userId);
		if (!user) return await this.getDatabaseHandler().createRowUser(userId, { exp: exp });
		return await this.getDatabaseHandler().updateRowUser(userId, { exp: user.get('exp') as number + exp });
	}

	async addExperienceGuild(userId: string, guildId: string, exp: number): Promise<any> {
		const user = await this.getDatabaseHandler().getOneRowGuild(guildId, { userId: userId});
		if (!user) return await this.getDatabaseHandler().createRowGuild(guildId, { userId: userId, exp: exp });
		return await this.getDatabaseHandler().updateRowGuild(guildId, { userId: userId, exp: user.get('exp') as number + exp });
	}
}