import Sequelize from "sequelize";
import { DBConnection } from "../dbConnection.db.class"
const sequelize = DBConnection.getInstance().sequelize

export const UserModel = sequelize.define(
	"users", {
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		username: {
			type: Sequelize.STRING,
		},
		experience: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		}
	}
);


