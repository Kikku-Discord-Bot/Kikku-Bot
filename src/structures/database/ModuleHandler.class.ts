import Sequelize, { CreateOptions, Optional, WhereOptions } from "sequelize";

export type SequelizeModel = Sequelize.ModelStatic<Sequelize.Model<any, any>>;

// Enum for database types
export enum DatabaseSchemaName {
	GLOBAL = "global",
	GUILD = "guild",
	USER = "user",
}

export class DatabaseModuleHandler {
	private _moduleName: string;
	private _schemas: Map<string, SequelizeModel> = new Map();
	private _tablesNames: Map<DatabaseSchemaName, string> = new Map();
	public constructor(moduleName: string) {
		this._moduleName = moduleName;
	}

	public async setSchema(schemaName: DatabaseSchemaName, schema: SequelizeModel) {
		this._schemas.set(schemaName, schema);
		this._tablesNames.set(schemaName, `${schemaName}_${this._moduleName}`);
		
	}

	public getSchema(schemaName: DatabaseSchemaName) {
		return this._schemas.get(schemaName);
	}

	public getSchemaName(schemaName: string) {
		switch (schemaName) {
		case "global":
			return DatabaseSchemaName.GLOBAL;
		case "guild":
			return DatabaseSchemaName.GUILD;
		case "user":
			return DatabaseSchemaName.USER;
		default:
			throw new Error("Schema name not found");
		}
	}

	public async getAllRowsGlobal() {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		return await schema.findAll({});
	}

	public async getAllRowsUser() {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({});
	}

	public async getAllRowsGuild() {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({});
	}
	
	public async getRowGlobal(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: searchFields });
	}

	public async getRowUser(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: searchFields });
	}

	public async getRowGuild(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: searchFields });
	}

	public async getRowsOfUser(userId: string) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.findAll({ where: {userId: userId} });
	}

	public async getRowsOfGuild(guildId: string) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.findAll({ where: {guildId: guildId} });
	}

	public async createRowGlobal(data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		return await schema.create(data, options);
	}

	public async createRowUser(data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		return await schema.create(data, options);
	}

	public async createRowGuild(data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		return await schema.create(data, options);
	}

	public async updateRowGlobal(searchFields: WhereOptions<any>, data: {[x: string]: any}) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update({ data }, { where: searchFields });
	}

	public async updateRowUser(searchFields: WhereOptions<any>, data: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update({ data }, { where: searchFields });
	}

	public async updateRowGuild(searchFields: WhereOptions<any>, data: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update({ data }, { where: searchFields });
	}

	public async deleteRowGlobal(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: searchFields });
	}

	public async deleteRowUser(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: searchFields });
	}

	public async deleteRowGuild(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: searchFields });
	}
}