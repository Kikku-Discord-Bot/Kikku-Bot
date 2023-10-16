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

	public async getAllRowsGlobal(searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		if (!searchFields)
			return await schema.findAll();
		return await schema.findAll({ where : searchFields });
	}

	public async getAllRowsUser(userId: string, searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		if (!searchFields)
			return await schema.findAll({ where: {userId: userId } });
		return await schema.findAll({ where: {userId, ...searchFields} });
	}

	public async getAllRowsGuild(guildId: string, searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		if (!searchFields)
			return await schema.findAll({ where: {guildId: guildId} });
		return await schema.findAll({ where: {guildId, ...searchFields} });
	}
	
	public async getOneRowGlobal(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: searchFields });
	}

	public async getOneRowUser(userId: string, searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: {...searchFields, userId} });
	}

	public async getOneRowGuild(guildId: string, searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		return await schema.findOne({ where: {...searchFields, guildId} });
	}

	public async createRowGlobal(data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) throw new Error("Schema not found");
		return await schema.create(data, options);
	}

	public async createRowUser(userId: string, data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) throw new Error("Schema not found");
		return await schema.create({...data, userId}, options);
	}

	public async createRowGuild(guildId: string, data: Optional<any, string>, options?: CreateOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) throw new Error("Schema not found");
		return await schema.create({...data, guildId}, options);
	}

	public async updateRowGlobal(searchFields: WhereOptions<any>, data: {[x: string]: any}) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update({ data }, { where: searchFields });
	}

	public async updateRowUser(userId: string, data: {[x: string]: any}, searchFields?: WhereOptions<any>,) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update(data, { where: {...searchFields, userId }});
	}

	public async updateRowGuild(guildId: string, data: {[x: string]: any},  searchFields?: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.update({ data }, { where: {...searchFields, guildId} });
	}

	public async deleteRowGlobal(searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GLOBAL);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: searchFields });
	}

	public async deleteRowUser(userId: string, searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.USER);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: {userId, ...searchFields} });
	}

	public async deleteRowGuild(guildId: string, searchFields: WhereOptions<any>) {
		const schema = this._schemas.get(DatabaseSchemaName.GUILD);
		if (!schema) { throw new Error("Schema not found"); }
		return await schema.destroy({ where: {guildId, ...searchFields} });
	}
}