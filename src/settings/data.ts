export interface I18nPluginSettings {
	settings: {
		// 插件路径
		plugins_path: string,
		// 使用语言
		language: string,
		// 日志
		log:boolean;
		// 网络文件 安全模式
		i18n_web_safemode:boolean,
		// 网络文件 下载地址
		i18n_web_url:string,
		// 网络API 安全模式
		i18n_api_safemode:boolean,
	},
	languages:Record<string, string>
}

export const DEFAULT_SETTINGS: I18nPluginSettings = {
	settings: {
		plugins_path: '.obsidian\\plugins',
		language: '',
		log:false,
		i18n_web_safemode: true,
		i18n_web_url: 'https://raw.githubusercontent.com/zero-worlds/obsidian-i18n/main/i18n',
		i18n_api_safemode: true
	},
	languages:{}
}
