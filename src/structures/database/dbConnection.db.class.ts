import { Sequelize, ConnectionError, ConnectionTimedOutError, TimeoutError } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
export class DBConnection {
	private static instance: DBConnection;
	private _sequelize: Sequelize;

	private constructor() {
		if (process.env.DB_NAME === undefined || 
			process.env.DB_USER === undefined || 
			process.env.DB_PASS === undefined || 
			process.env.DB_HOST === undefined || 
			process.env.DB_PORT === undefined) {
			throw new Error("Missing database environment variables");
		}
		this._sequelize = new Sequelize(
			process.env.DB_NAME,
			process.env.DB_USER,
			process.env.DB_PASS,
			{
				dialect: "mariadb",
				host: process.env.DB_HOST,
				port: parseInt(process.env.DB_PORT),
				retry: {
					max: 5,
					match: [
						ConnectionError,
						ConnectionTimedOutError,
						TimeoutError,
						/Deadlock/i,
						"SQLITE_BUSY",
					]
				},
			}
		);
	}

	public static getInstance(): DBConnection {
		if (!DBConnection.instance) {
			try {
				DBConnection.instance = new DBConnection();
			} catch (err) {
				console.error(err);
				process.exit(0);
			}
		}
		return DBConnection.instance;
	}

	public get sequelize(): Sequelize {
		return this._sequelize;
	}
}