import { RequestUrlParam, requestUrl } from "obsidian";
import * as path from "path";

import I18N from "./main";

export default class Api {
	i18n: I18N;
	// [初始化] 变量
	constructor(i18n:I18N) {
		// [初始化] I18n插件
		this.i18n = i18n;
	}

	private getRequest(url: string){
		const req: RequestUrlParam = {
			url: url,
			method: 'GET',
			headers: {"Content-Type": "application/json"}
		};
		return req
	}

	// 获取 网络文件 目录
    async getDirectory(){
		try{
			const request = this.getRequest(path.join(this.i18n.settings.i18n_web_url, 'directory.json'));
			// 这样就可以直接获取了
			const data = await requestUrl(request);
			// [status] [headers] [arrayBuffer] [json] [text]
			return {code: true, text: data.text};
		}catch(e){
			const error = this.error(e)
			console.error(error);
			return {code: false, text: error};
		}
	}
	
	// 获取 网络文件
	async getWeb(plugin: string ,lang: string){
		try{
			const request = this.getRequest(path.join(this.i18n.settings.i18n_web_url, `plugins/${plugin}/${lang}.json`));
			const data = await requestUrl(request);
			return {code: true, text: data.text};
		}catch(e){
			const error = this.error(e)
			console.error(error);
			return {code: false, text: error};
		}
	}

	private error(error: string) : string{
		if(error == 'Error: net::ERR_CONNECTION_REFUSED'){
			return '请求已被拒绝'
		}
		if (error == 'Error: net::ERR_ADDRESS_INVALID') {
			return '请求地址无效'
		}
		if (error == 'Error: Request failed, status 400') {
			return '请求失败 状态400'
		}
		if(error == 'Error: Request failed, status 404'){
			return '请求失败 状态404'
		}
		if(error == 'Error: Request failed, status 414'){
			return '请求失败 状态414'
		}
		if(error == 'Error: Request failed, status 502'){
			return '请求失败 状态502'
		}
		if(error == 'Error: net::ERR_HTTP2_PROTOCOL_ERROR'){
			return 'HTTP2 协议错误'
		}
		return `${error}`
	}
}