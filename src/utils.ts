import * as path from 'path'
import * as fs from 'fs'

export default class Utils {
}

export class I18NState{
	path:string;
	constructor(lang_path:string){
		this.path = path.join(lang_path, '/lang/state.json');
	}

	// flag配置 "a":追加写入，"w":写入，"r":读取
	// 判断文件是否存在
	is_state(){
		return fs.existsSync(this.path);
	}
	// [新增]
	insert(){
		const state = {
			'is_i18n':false,
			'i18n_version':'',
			'plugin_version':''
		}
		// 转文本
		const data = JSON.stringify(state);
		fs.writeFileSync(this.path, data, {encoding:'utf-8', flag:'w'});
		return this.is_state() ? true : false;
	}
	// [删除]
	delete(){
		if(!this.is_state()){
			return false;
		}
		fs.unlinkSync(this.path);
		// [日志]
		return this.is_state() ? false : true;
	}
	// [修改]
	update(is_i18n: boolean, i18n_version: string, plugin_version: string){
		if(!this.is_state()){
			return false;
		}
		const state = {
			'is_i18n': is_i18n,
			'i18n_version':i18n_version,
			'plugin_version':plugin_version
		}
		const data = JSON.stringify(state);
		fs.writeFileSync(this.path, data, {encoding:'utf-8', flag:'w'});

		const update_state = fs.readFileSync(this.path).toString();
		if(data == update_state){
			return true;
		}
		if(!(data == update_state)){
			return false;
		}
	}
	// [查询]
	select(){
		if(!this.is_state()){
			return false;
		}
		const res = fs.readFileSync(this.path);
		return JSON.parse(res.toString());
		return true;
	}
	// [重置]
	reset(){
		if(!this.is_state()){
			return false;
		}
		const state = {
			'is_i18n':false,
			'i18n_version':'',
			'plugin_version':''
		}
		// 转文本
		const data = JSON.stringify(state);
		fs.writeFileSync(this.path, data, {encoding:'utf-8', flag:'w'});
		// [日志]
		const update_state = fs.readFileSync(this.path).toString();
		if(data == update_state){
			return true;
		}
		if(!(data == update_state)){
			return false;
		}
	}
}

export class Console{
	is_log:boolean;
	constructor(is_log:boolean){
		this.is_log = is_log;
	}

	log(message?:unknown){
		if(this.is_log){
			console.log(message)
		}
	}

	debug(message:string){
		if(this.is_log){
			console.debug(message)
		}
	}

	info(message:string){
		if(this.is_log){
			console.info(message)
		}
	}

	warn(message:string){
		if(this.is_log){
			console.warn(message)
		}
	}
	
	error(message:string){
		if(this.is_log){
			console.error(message)
		}
	}

	table(tabularData: unknown){
		if(this.is_log){
			console.table(tabularData)
		}
	}

	group(message: unknown){
		if(this.is_log){
			console.group(message)
		}
	}

	groupCollapsed(message: unknown){
		if(this.is_log){
			console.groupCollapsed(message)
		}
	}

	groupEnd(){
		if(this.is_log){
			console.groupEnd()
		}
	}

	clear(){
		console.clear()
	}
}


