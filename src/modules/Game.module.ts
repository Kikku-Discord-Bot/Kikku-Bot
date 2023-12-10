import { BaseModule } from "@src/structures";
import * as Sequelize from "sequelize";

export class GameModule extends BaseModule {
	constructor() {
		super("Game", "1.0.0", true);
	}
}