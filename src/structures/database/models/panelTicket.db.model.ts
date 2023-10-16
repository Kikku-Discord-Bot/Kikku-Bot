import Sequelize from "sequelize";
import { DBConnection } from "../dbConnection.db.class"
import { GuildModel } from "./guild.db.model";
import { UserModel } from "./user.db.model";
import { TicketModel } from "./ticket.db.model";
const sequelize = DBConnection.getInstance().sequelize

export const PanelTicketModel = sequelize.define(
	"panel_tickets", {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING,
		},
		description: {
			type: Sequelize.STRING,
		},
		roles: {
			type: Sequelize.JSON,
		},
		category: {
			type: Sequelize.STRING,
		},
		transcript_channel: {
			type: Sequelize.STRING,
		},
		send_channel: {
			type: Sequelize.STRING,
		},
		status: {
			type: Sequelize.ENUM("edit", "finish", "to_delete", "draft"),
			defaultValue: "edit",
		},
		fkGuild: {
			type: Sequelize.STRING,
			references: {
				model: GuildModel,
				key: "id",
			},
			allowNull: false,
			primaryKey: true,
		},
		fkUser: {
			type: Sequelize.STRING,
			references: {
				model: UserModel,
				key: "id",
			},
			allowNull: false,
			primaryKey: true,
		},
	}
);

PanelTicketModel.beforeDestroy(async (panelTicket) => {
	const tickets = await TicketModel.findAll({
		where: {
			fkPanel: panelTicket.get("id"),
		}
	})

	for (const ticket of tickets) {
		await ticket.update({
			fkPanel: null,
		})
	}
})