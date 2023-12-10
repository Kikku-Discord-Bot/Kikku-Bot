import { rejects } from "assert";
import axios, { AxiosInstance } from "axios";

export enum JikanOrderBy {
    FAVORITES = "favorites",
    NAME = "name",
    ID = "mal_id",
}

export enum JikanSort {
    ASC = "asc",
    DESC = "desc"
}

interface JikanImage {
    jpg: {
        image_url: string;
    }
    webp:  {
        image_url: string;
        small_image_url: string;
    }
}

interface JikanPagination {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
        count : number;
        total: number;
        per_page: number;
    }
}

export interface JikanCharacter {
    mal_id: number;
    url: string;
    name: string;
    name_kanji: string;
    nicknames: string[];
    about: string;
    favorites: number;
    images: JikanImage;
}

export interface JikanSearchCharacter {
    data: JikanCharacter[];
    pagination: JikanPagination;
}


export class Jikan {

	private static _instance: Jikan;
	private static _baseUrl = "https://api.jikan.moe/v4";
	private static _axios: AxiosInstance;
	private static _maxRequestPerMinute = 60;
	private static _maxRequestPerSecond = 3;
	private _countRequestLastMinute: {date: Date}[] = [];
	private _countRequestLastSecond: {date: Date}[] = [];

	public static get instance(): Jikan {
		return this._instance || (this._instance = new this());
	}

	constructor() {
		if (Jikan._instance) {
			throw new Error("Cannot create a new instance of this class");
		}
		Jikan._axios = axios.create({
			baseURL: Jikan._baseUrl,
			timeout: 10000,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	public async requestHandler<T>(requestUrl: string): Promise<T> {

		const now = new Date();
		this._countRequestLastMinute = this._countRequestLastMinute.filter((date) => date.date.getTime() > now.getTime() - 60000);
		this._countRequestLastSecond = this._countRequestLastSecond.filter((date) => date.date.getTime() > now.getTime() - 1000);

		if (this._countRequestLastMinute.length >= Jikan._maxRequestPerMinute) {
			rejects(() => Promise.reject("Too many request per minute"));
		}
		if (this._countRequestLastSecond.length >= Jikan._maxRequestPerSecond) {
			rejects(() => Promise.reject("Too many request per second"));
		}

		return new Promise((resolve, reject) => {
			this._countRequestLastMinute.push({date: now});
			this._countRequestLastSecond.push({date: now});
			Jikan._axios.get(requestUrl).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	}


	public async getCharacter(id: number): Promise<any> {
		return await this.requestHandler(`/character/${id}`)
	}

	public async getCharactersSearch(query: string, orderBy?: JikanOrderBy, sort?: JikanSort, page?: number): Promise<JikanSearchCharacter> {
		return await this.requestHandler<JikanSearchCharacter>(`/characters?q=${query}&page=${page || 1}&order_by=${orderBy || JikanOrderBy.FAVORITES}&sort=${sort || JikanSort.DESC}`)
	}

	public async getAnime(id: number): Promise<any> {
		return await this.requestHandler(`/anime/${id}`)
	}

	public async getManga(id: number): Promise<any> {
		return await this.requestHandler(`/manga/${id}`)
	}
}