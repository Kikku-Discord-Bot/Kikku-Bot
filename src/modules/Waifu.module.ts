import { BaseModule } from "@src/structures";
import * as Sequelize from "sequelize";

export class WaifuModule extends BaseModule {
	constructor() {
		super("Waifu", "0.1.0", true, {
			"user": {	
				fields: [
					{
						"name": "waifu",
						"type": Sequelize.STRING,
						allowNull: false,
					},
					{
						"name": "xp",
						"type": Sequelize.INTEGER,
						allowNull: false,
						defaultValue: 0,
					},
					{
						"name": "level",
						"type": Sequelize.INTEGER,
						allowNull: false,
						defaultValue: 1,
					},
					{
						"name": "rank",
						"type": Sequelize.STRING,
						allowNull: false,
						defaultValue: "N",
					},
					{
						"name": "money",
						"type": Sequelize.INTEGER,
						allowNull: false,
						defaultValue: 0
					},
					{
						"name": "inventory",
						"type": Sequelize.JSON,
						allowNull: false,
						defaultValue: []
					},
					{
						"name": "inventorySize",
						"type": Sequelize.INTEGER,
						allowNull: false,
						defaultValue: 10
					},
				],
			},
		});
	}
}