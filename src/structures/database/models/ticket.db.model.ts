import Sequelize from "sequelize";
import { DBConnection } from "../dbConnection.db.class"
import { UserModel } from "./user.db.model";
import { GuildModel } from "./guild.db.model";
import { PanelTicketModel } from "./panelTicket.db.model";

const sequelize = DBConnection.getInstance().sequelize

export const TicketModel = sequelize.define(
	"tickets", {
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		owner: {
			type: Sequelize.STRING,
			references: {
				model: UserModel,
				key: "id",
			},
		},
		permissions: {
			type: Sequelize.JSON,
		},
		embedMessage: {
			type: Sequelize.STRING,
			defaultValue: 0,
		},
		fkPanel: {
			type: Sequelize.UUID,
			references: {
				model: PanelTicketModel,
				key: "id",
			},
			allowNull: true,
		},
	}
);

export const GuildTicketModel = sequelize.define(
	"guild_tickets", {
		fkTicket: {
			type: Sequelize.STRING,
			references: {
				model: TicketModel,
				key: "id",
			},
			allowNull: false,
			primaryKey: true,
		},
		fkGuild: {
			type: Sequelize.STRING,
			references: {
				model: GuildModel,
				key: "id",
			},
			primaryKey: true,
		}
	}, {
		timestamps: false,
		createdAt: false,
		updatedAt: false,
	}
);

export const UserTicketModel = sequelize.define(
	"users_tickets", {
		fkTicket: {
			type: Sequelize.STRING,
			references: {
				model: TicketModel,
				key: "id",
			},
			allowNull: false,
		},
		fkUser: {
			type: Sequelize.STRING,
			references: {
				model: UserModel,
				key: "id",
			},
			allowNull: false,
		}
	}, {
		timestamps: false,
		createdAt: false,
		updatedAt: false,
	}
);