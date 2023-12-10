import { BaseModule } from "@src/structures";
import * as Sequelize from "sequelize";

export class AdminModule extends BaseModule {
	constructor() {
		super("Admin", "0.2.0", true);
	}
}