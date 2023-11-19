import { App, ButtonComponent, Modal, Notice, Plugin, Setting, addIcon } from 'obsidian';

import * as path from 'path'
import * as fs from 'fs'

import { DEFAULT_SETTINGS, I18nPluginSettings } from './settings/data'
import { I18nSettingTab } from './settings/ui/settings';

import { I18NState, Console } from './utils';
import Api from './api';

// 记住重命名这些类和接口！

interface IPlugin {
    id: string;
    name: string;
    version: string;
    author: string;
	path: string;
}

interface IDirectory{
	plugin:string,
	languages:Array<string>
}

// ==============================
//          [入口] I18n
// ==============================
export default class I18N extends Plugin {
	// [变量] 总配置文件
	i18nSettings: I18nPluginSettings;
	// [变量] 基础配置文件
	settings: I18nPluginSettings['settings'];
	// [变量] 语言配置文件
	languages: I18nPluginSettings['languages'];
	
	// 生命周期函数在用户激活 Obsidian 插件时触发。这将是您设置插件大部分功能的地方。该方法在插件更新时也会被触发。
	async onload() {
		// [加载] 欢迎语句
		new Notice('[开启]i18n');

		// [初始化] 配置文件
		await this.loadSettings();
		// [初始化] 基础配置文件
		this.settings = this.i18nSettings.settings;

		// [初始化] 语言配置文件
		this.languages = this.i18nSettings.languages;
		// 图标
		addIcon("i18n", `<svg t="1699770576608" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1455" width="100" height="100"><path d="M848.806 805.572c70.998-81.26 109.78-184.217 109.78-293.144 0-119.205-46.422-231.278-130.714-315.57C744.877 113.863 634.941 67.617 517.79 66.214c-1.925-0.6-10.29-0.592-12.228 0.015-116.682 1.717-226.127 47.931-308.826 130.63C113.863 279.732 67.63 389.46 66.095 506.417c-0.428 1.65-0.437 8.602-0.021 10.227 1.083 117.628 47.365 228.058 130.66 311.354 84.292 84.292 196.364 130.713 315.57 130.713 119.205 0 231.277-46.421 315.57-130.713 6.139-6.14 12.054-12.444 17.788-18.872a20.532 20.532 0 0 0 1.472-1.44 20.566 20.566 0 0 0 1.672-2.113zM107.447 532.043H294.95c1.322 65.68 9.253 127.265 22.505 182.113-61.69 16.687-100.82 38.372-121.076 51.906-52.068-64.726-84.702-145.705-88.93-234.019z m88.434-272.635c20.09 13.557 59.243 35.462 121.34 52.26-12.997 54.128-20.826 114.778-22.243 179.433H107.526c4.55-87.37 36.912-167.489 88.355-231.693z m721.2 231.692H729.63c-1.416-64.631-9.24-125.26-22.23-179.374 61.955-16.694 101.236-38.445 121.567-52.021 51.305 64.155 83.571 144.161 88.116 231.395z m-228.403 0h-156.51V335.061c52.208-1.095 97.103-6.454 135.272-14.033C680 373.164 687.286 430.897 688.678 491.1z m-156.51-196.984V109.918c36.84 10.4 72.779 49.206 100.926 110.016 8.81 19.036 16.645 39.642 23.464 61.521-35.026 6.772-76.296 11.608-124.39 12.66z m-40.944-183.842v183.805c-47.505-1.127-88.379-6.002-123.12-12.803 6.807-21.813 14.623-42.36 23.409-61.344 27.839-60.14 63.296-98.756 99.71-109.658z m0 224.767V491.1H335.929c1.392-60.213 8.68-117.955 21.244-170.1 37.835 7.537 82.314 12.887 134.05 14.04z m-155.33 197.002h155.33v158.668c-51.61 1.194-96.02 6.564-133.822 14.103-12.825-52.886-20.208-111.57-21.509-172.77z m155.33 199.63v182.909c-36.416-10.902-71.872-49.519-99.71-109.66-8.68-18.752-16.41-39.034-23.158-60.55 34.64-6.727 75.417-11.552 122.868-12.7z m40.943 183.264V731.609c47.904 1.025 89.104 5.862 124.117 12.656-6.756 21.556-14.497 41.874-23.19 60.656-28.147 60.81-64.086 99.617-100.927 110.016z m0-224.277V532.043h156.547c-1.299 61.097-8.66 119.685-21.446 172.503-38.114-7.532-82.949-12.835-135.1-13.886zM729.66 532.043h187.502c-4.221 88.139-36.733 168.974-88.62 233.636-20.47-13.669-59.636-35.3-121.304-51.869 13.2-54.76 21.102-116.225 22.422-181.767z m71.86-303.3c-18.33 11.57-52.31 29.355-104.858 43.493-19.296-63.056-46.11-115.004-78.062-150.976 70.401 19.15 133.234 56.837 182.92 107.483zM406.008 121.26c-31.906 35.92-58.69 87.769-77.979 150.702-52.404-14.241-86.37-32.099-104.582-43.588 49.63-50.46 112.33-88.01 182.561-107.114z m-182.09 675.703c18.284-11.536 52.098-29.23 104.332-43.336 19.272 62.605 45.976 114.187 77.758 149.969C336 884.55 273.472 847.182 223.918 796.963z m394.68 106.633c31.802-35.804 58.519-87.426 77.794-150.082 51.985 14.023 85.972 31.631 104.533 43.208-49.592 50.34-112.206 87.8-182.326 106.874z" p-id="1456" fill="currentColor"></path></svg>`);
		// ==============================
		//        [功能区] 翻译
		// ==============================
		this.addRibbonIcon('i18n', '翻译', (evt: MouseEvent) => {
			console.clear();
			new TranslateModal(this.app, this).open();
		});

		// ==============================
		//        [状态栏] 测试
		// ==============================
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText(`[语言] 简体中文`);
		
		// ==============================
		//        [设置] 主页面
		// ==============================
		this.addSettingTab(new I18nSettingTab(this.app, this));
	}

	// 命周期函数在插件被禁用时触发。插件所调用的任何资源必须在这里得到释放，以防止在您的插件被禁用后对 Obsidian 的性能产生影响。
	onunload() {
		new Notice('[关闭]i18n');
	}

	async loadSettings() {
		this.i18nSettings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.i18nSettings);
	}
}

// ============================================================
// 
//                  侧边栏 对话框 翻译
// 
// ============================================================
class TranslateModal extends Modal {
	// [插件][变量] I18n插件
	i18n: I18N;

	// [本地][变量] 项目目录路径
	base_path: string;
	// [本地][变量] 插件文件夹路径
	plugins_path: string;
	// [本地][变量] 插件列表
	plugins = new Array<IPlugin>();

	// [网络][变量] 网络文件目录
	directory: IDirectory[];
	// [网络][变量] 网络连接状态
	web_mark = true;

	// [工具][变量] API 工具
	api: Api;
	// [工具][变量] 控制台输出 工具
	console: Console;

	// ============================================================
	// 
	//                        初始化
	// 
	// ============================================================
	constructor(app: App, i18n:I18N) {
		super(app);

		// [初始化] I18n插件
		this.i18n = i18n;
		// [初始化] 工作目录
		this.base_path = path.normalize(this.app.vault.adapter.basePath);
		// [初始化] 插件目录
		this.plugins_path = path.join(this.base_path, this.i18n.settings.plugins_path);

		// [初始化] 工具类
		this.console = new Console(this.i18n.settings.log) 
		this.api = new Api(this.i18n);
	}

	// ============================================================
	// 
	//                        初始化
	// 
	// ============================================================
	async init_plugins(){
		this.console.group('[初始化] 变量');
		// 插件文件夹
		const plugin_folders = fs.readdirSync(this.plugins_path);
		// 获取所有插件数据
		for (let i = 0; i < plugin_folders.length; i++) {
			// [路径] 插件路径
			const plugin_path = path.join(this.plugins_path, plugin_folders[i]);
			// [路径] 插件描述文件路径
			const manifest_path = path.join(plugin_path, 'manifest.json');

			// [获取] 插件描述文件<Json>
			const manifest = JSON.parse(fs.readFileSync(manifest_path).toString());

			// [临时] 插件对象
			const plugin: IPlugin = {
				id: manifest.id,
				name: manifest.name,
				version: manifest.version,
				author: manifest.author,
				path: plugin_path
			}

			// [添加] 将获取到插件对象添加至对象列表
			this.plugins.push(plugin);
		}
		this.console.log(`[插件数量] 共计 ${this.plugins.length} 个插件`);
		this.console.log('[插件列表]');
		this.console.table(this.plugins);

		// 当安全模式关闭时 获取
		if(!this.i18n.settings.i18n_web_safemode){
			// 获取数据
			const data = await this.api.getDirectory();
			// 判断请求
			if(data.code){
				this.directory = JSON.parse(data.text);
				this.console.log(typeof(this.directory));
				this.console.log('[目录列表]');
				this.console.table(this.directory);
			}else{
				this.console.log('[目录列表]');
				// 请求标记失败
				this.web_mark = false;
				// 请求失败返回内容
				new Notice(`❗${data.text}`);
			}
		}
		this.console.groupEnd();
	}
	
	// ============================================================
	// 
	//                        渲染
	// 
	// ============================================================
	async init_show(){
		// [对话框] 翻译
		this.console.groupCollapsed(`[初始化] 渲染`);
		const { contentEl } = this;
		
		const block = new Setting(contentEl);

		block.setName('语言')
		// 更改语言
		block.addDropdown(cb => cb
			.addOptions(this.i18n.languages)
			.setValue(this.i18n.settings.language)
			.onChange(async (value)=>{
				this.i18n.settings.language = value;
				this.i18n.saveSettings();
				this.console.log(`[配置] language: ${this.i18n.settings.language}`)
				// 重载页面
				this.reload();
			})
		);

		// [临时变量] 翻译语言
		const lang = this.i18n.settings.language;
		this.console.log(`[临时变量] 翻译语言 => ${lang}`);
		// [临时变量] 网络文件 安全模式
		const i18n_web_safemode = this.i18n.settings.i18n_web_safemode;
		this.console.log(`[临时变量] 网络文件 安全模式 => ${i18n_web_safemode ? '开启': '关闭'}`);
		// [临时变量] API 安全模式
		const i18n_api_safemode = this.i18n.settings.i18n_api_safemode;
		this.console.log(`[临时变量] API 安全模式 => ${i18n_api_safemode ? '开启': '关闭'}`);

		for(const plugin of this.plugins) {
			this.console.groupCollapsed(`[${plugin.name}]`);
			// ============================================================
			// 
			//                        基础信息
			// 
			// ============================================================
			// [渲染] 块元素
			const block = new Setting(contentEl);
			// [信息] 名称
			block.setName(plugin.name);
			// [信息] 作者
			block.descEl.createDiv({text:"作者: " + plugin.author});
			// [信息] 版本
			block.descEl.createDiv({text:"版本: " + plugin.version});

			// [临时变量] 语言目录
			const lang_path = path.join(plugin.path, `/lang`);
			// this.console.log(`[临时变量] 本地翻译文件目录 => ${lang_path}`);

			// [临时变量] 翻译文件路径
			const lang_file_path = path.join(lang_path, `${lang}.json`);
			// this.console.log(`[临时变量] 本地翻译文件路径 => ${lang_file_path}`);

			// [临时变量] 本地翻译文件是否存在
			const is_lang_file = fs.existsSync(lang_file_path);
			// this.console.log(`[临时变量] 本地翻译文件是否存在 => ${is_lang_file}`);

			// [临时变量] 状态文件 操作函数
			const i18nstate = new I18NState(plugin.path);

			// [临时变量] 状态文件 当前状态
			const state = i18nstate.select()

			// ============================================================
			// 
			//                     插件更新 翻译还原
			// 
			// ============================================================
			// 状态文件存在 并且 为翻译状态 并且 版本已经更新了
			if(i18nstate.is_state() && state.is_i18n && plugin.version != state.plugin_version){
				// // 删除翻译过的文件
				fs.unlinkSync(path.join(plugin.path, 'main-copy.js'));
				// // 更新翻译状态
				i18nstate.update(false, '', plugin.version);
				new Notice(`💬[${plugin.name}] 插件更新 翻译还原`);
			}

			// ============================================================
			// 
			//                        翻译状态
			// 
			// ============================================================
			if(state.is_i18n){
				this.console.log('[本地][状态] 🟢已翻译');
			}else{
				this.console.log('[本地][状态] 🔴未翻译');
			}

			// ============================================================
			// 
			//                        网络操作
			// 
			// ============================================================
			// 检测下载
			if(i18n_web_safemode == false && this.web_mark && !is_lang_file){
				
				// [判断] 网络是否连接成功 以 网络中是否拥有翻译文件
				if(plugin.name in this.directory){
					const langs = this.directory[plugin.name];
					this.console.table('[网络][目录]');
					this.console.table(langs);

					if(langs.includes(lang)){
						this.console.log('[网络][译文] 🟢 存在');
						const cb = new ButtonComponent(block.controlEl);
						cb.setCta()
						cb.setButtonText('下载');
						cb.onClick(async ()=>{
							new Notice('💬[网络] 下载中...');
							cb.setDisabled(true);
							// 获取网络中的 数据
							const data = await this.api.getWeb(plugin.name, lang);
							if(data.code){
								// 判断是否有LANG文件夹 没有就创建
								if(!fs.existsSync(lang_path)){
									fs.mkdirSync(lang_path);
								}
								this.console.log(data.text)
								// 下载保存到本地
								fs.writeFileSync(lang_file_path, data.text);
								// 刷新操作
								this.reload()
							}else{
								new Notice(`❗${data.text}`);
							}
							cb.setDisabled(false);
							new Notice('💬[网络] 下载完成');
						})
					}else{
						this.console.log('[网络][译文] 🔴 不存在');
					}
				}
			}
			
			// 检测更新
			if(i18n_web_safemode == false && this.web_mark && is_lang_file){
				// 读取本地翻译文件
				const local_lang_text = fs.readFileSync(lang_file_path);
				// 请求 网络文件
				const data = await this.api.getWeb(plugin.name, lang);
				if(data.code){
					// 本地语言文件 转 json对象
					const local_lang_json = JSON.parse(local_lang_text.toString());
					// 网络语言文件 转 json对象
					const web_lang_json = JSON.parse(data.text);
					// [判断] 本地是否需要更新
					if(local_lang_json['manifest']['version'] != web_lang_json['manifest']['version']){
						const cb = new ButtonComponent(block.controlEl);
						cb.setCta();
						cb.setButtonText('更新');
						cb.onClick(()=>{
							cb.setDisabled(true);
							this.console.log('[网络] 本地版本' + (local_lang_json['manifest']['version']))
							this.console.log('[网络] 在线版本' + (web_lang_json['manifest']['version']))
							this.console.log(`[本地] 当前翻译状态 ${state.is_i18n}`)
							
							// 判断翻译状态
							if(state.is_i18n){
								new Notice('💬[网络] 请先进行还原');
							}else{
								new Notice('💬[网络] 更新中...');
								// 更新保存文件
								fs.writeFileSync(lang_file_path, data.text);
								// 更新状态文件

								i18nstate.update(state.is_i18n, web_lang_json['manifest']['version'], state.plugin_version);
								// 刷新操作
								this.reload()
								new Notice('💬[网络] 更新完成');
							}
							cb.setDisabled(false);
						});
					}
				}else{
					new Notice('💬[网络] 翻译文件 请求失败');
				}
			}

			// ============================================================
			// 
			//                        翻译操作
			// 
			// ============================================================
			// 检测 语言目录 是否存在
			if(!fs.existsSync(lang_path)){
				this.console.log('[本地][目录] 🔴不存在');
				this.console.groupEnd();
				continue;
			}else{
				this.console.log('[本地][目录] 🟢存在');
			}
			
			// 检测 状态文件 是否存在 没有则创建一个默认的
			if(!i18nstate.is_state()){
				// 当状态文件不存在的时候新建状态文件
				i18nstate.insert();
			}

			// 检查是否存在翻译文件
			if(is_lang_file){
				this.console.log('[本地][译文] 🟢存在')
				// [判断] 翻译状态 当已翻译时进行 还原按钮渲染
				if(state.is_i18n){
					const cb = new ButtonComponent(block.controlEl);
					cb.setButtonText('还原');
					cb.setDisabled(false);
					cb.onClick(()=>{
						// 按钮不可在进行点击
						cb.setDisabled(true);
						// 删除翻译过的文件
						fs.unlinkSync(path.join(plugin.path, 'main.js'));
						
						// 将备份文件更改名称
						fs.renameSync(path.join(plugin.path, 'main-copy.js'), path.join(plugin.path, 'main.js'));
						// 更新翻译状态
						i18nstate.update(false, '', plugin.version);
						// 刷新列表
						this.reload();
						new Notice('[还原] 重启 Obsidian 生效');
					});
				}

				// [判断] 翻译状态 当未翻译时进行 翻译按钮渲染
				if(!state.is_i18n){
					const cb = new ButtonComponent(block.controlEl);
					cb.setButtonText('翻译');
					cb.setDisabled(false);
					cb.onClick(()=>{
						// this.console.groupCollapsed('[翻译]');
						// 按钮不可在进行点击
						cb.setDisabled(true);
						// 创建文件备份
						fs.copyFileSync(path.join(plugin.path, 'main.js'), path.join(plugin.path, 'main-copy.js'));

						// 语言文件路径
						const lang = fs.readFileSync(lang_file_path);
						const json_object = JSON.parse(lang.toString());
						this.console.log('对照表');
						this.console.table(json_object['dict']);

						// 读取并转换为字符串
						let res = fs.readFileSync(path.join(plugin.path, 'main.js')).toString();
						// 对翻译表进行逐条翻译
						for(const key in json_object['dict']){
							res = res.replaceAll(key, json_object['dict'][key]);
						}
						// 写入
						fs.writeFileSync(path.join(plugin.path, 'main.js'), res, 'utf-8');

						// 更新翻译状态
						i18nstate.update(true, json_object['manifest'].version, plugin.version);
						
						// 刷新列表
						this.reload();

						new Notice('[翻译]重启 Obsidian 生效');
						// this.console.groupEnd();
					});
				}
			}else{
				// 判断是否有
				this.console.log('[本地][译文] 🔴不存在')
			}

			// 检查是否需要删除内容
			// if(lang_path){
			// 	const cb = new ButtonComponent(block.controlEl);
			// 		cb.setButtonText('删除');
			// 		cb.setWarning();
			// 		cb.setDisabled(false);
			// 		cb.onClick(()=>{
			// 			// 按钮不可在进行点击
			// 			cb.setDisabled(true);
			// 			// 删除目录
			// 			this.removeDier(lang_path);
			// 			new Notice('[删除] 翻译内容已清空');
			// 			// 刷新列表
			// 			this.reload();
						
			// 		});
			// }

			// [插件]
			this.console.groupEnd();
		}
		// [渲染]
		this.console.groupEnd();
	}
	
	// 内部 重载函数
	private reload(){
		this.plugins = [];
		this.close();
		this.open();
	}

	private removeDier(path: string){
        const data = fs.readdirSync(path);
        for(let i = 0; i < data.length; i++){
                // 是文件或者是目录  是文件直接删除  目录直接删除
                const url = path + "/" + data[i];
                const stat = fs.statSync(url);
                if(stat.isDirectory()){
                        // 继续查找
                        this.removeDier(url);
                }else{
                        // 文件删除
                        fs.unlinkSync(url);
                }
        }
        fs.rmdirSync(path);      
	}

	// [开启]
	async onOpen() {
		const { contentEl } = this;

		contentEl.setText('插件列表');

		// [初始化] 插件列表
		await this.init_plugins();
		await this.init_show();
	}
	// [关闭]
	async onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}



