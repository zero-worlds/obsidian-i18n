import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

import I18N from "../../main";
import API from '../../api';

// 设置界面
class I18nSettingTab extends PluginSettingTab {
	// 设置对应的函数
	i18n: I18N;

	api: API;
	constructor(app: App, i18n: I18N) {
		super(app, i18n);
		this.i18n = i18n;
		this.api = new API(i18n);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ==============================
		//         基础设置标题
		// ==============================
		containerEl.createEl('h2', { text: '[i18n] 基础设置' });

		// ==============================
		//         插件路径
		// ==============================
		new Setting(containerEl)
			.setName('路径')
			.setDesc('[必填] 选择插件文件夹路径')
			.addText(cb => cb
				.setPlaceholder('插件路径')
				.setValue(this.i18n.settings.plugins_path)
				.onChange(async (value) => {
					this.i18n.settings.plugins_path = value;
					await this.i18n.saveSettings();
					console.log(`[配置] plugins_path: ${this.i18n.settings.plugins_path}`)
				})
			);
		// ==============================
		//         翻译语言
		// ==============================
		new Setting(containerEl)
			.setName('语言')
			.setDesc('选择需要翻译的语言')
			.addDropdown(cb => cb
				.addOptions(this.i18n.languages)
				.setValue(this.i18n.settings.language)
				.onChange(async (value)=>{
					this.i18n.settings.language = value
					await this.i18n.saveSettings();
					console.log(`[配置] language: ${this.i18n.settings.language}`)
				})
			);
		// ==============================
		//         翻译语言
		// ==============================
		const log = new Setting(containerEl);
		log.setName('日志');
		log.setDesc('是否开启日志调试');
		log.addToggle(cb => cb
			.setValue(this.i18n.settings.log)
			.onChange(()=>{
				this.i18n.settings.log = !this.i18n.settings.log;
				this.i18n.saveSettings();
				console.log(`[配置] log: ${this.i18n.settings.log}`)
			})
		);
		
		// ==============================
		//         网络文件标题
		// ==============================
		containerEl.createEl('h2', { text: '[i18n] 网络文件' });

		// ==============================
		//         网络文件安全模式
		// ==============================
		const file_safemode = new Setting(containerEl);
		file_safemode.setName('安全模式');
		file_safemode.setDesc('关闭安全模式 将会从网络下载翻译文本');
		file_safemode.addToggle(cb => cb
			.setValue(this.i18n.settings.i18n_web_safemode)
			.onChange(()=>{
				this.i18n.settings.i18n_web_safemode = !this.i18n.settings.i18n_web_safemode;
				this.i18n.saveSettings();
				console.log(`[配置] i18n_web_safemode: ${this.i18n.settings.i18n_web_safemode}`)
			})
		);
		
		// ==============================
		//         网络文件路径
		// ==============================
		const file_url = new Setting(containerEl);
		file_url.setName('网络路径');
		file_url.setDesc('下载翻译文本的网络路径 默认为GitHub');
		file_url.addText(cb => cb
			.setPlaceholder('URL')
			.setValue(this.i18n.settings.i18n_web_url)
			.onChange((value) => {
				this.i18n.settings.i18n_web_url = value;
				this.i18n.saveSettings();	
				console.log(`[配置] i18n_web_url: ${this.i18n.settings.i18n_web_url}`)
			})
		);

		// ==============================
		//         网络文件路径测试
		// ==============================
		const file_url_test = new Setting(containerEl);
		file_url_test.setName('测试');
		file_url_test.setDesc('下载翻译文本的网络路径 测试时候连接正常');
		file_url_test.addButton(cb => cb
			.setButtonText('测试')
			.onClick(async (value) => {
				file_url_test.setDisabled(true);

				const code = await this.api.getDirectory();
				if (code){
					new Notice('[网络] 连接成功');
				}else{
					new Notice('[网络] 连接失败(请检查网络)');
				}
				file_url_test.setDisabled(false);
			})
		);

		// ==============================
		//         网络API标题
		// ==============================
		containerEl.createEl('h2', { text: '[i18n] 翻译接口 (未完成)' });

		// ==============================
		//         网络API安全模式
		// ==============================
		// const api_safemode = new Setting(containerEl)
		// api_safemode.setName('安全模式');
		// api_safemode.setDesc('关闭安全模式 将会从网络API翻译文本');
		// api_safemode.addToggle(cb => cb
		// 	.setValue(this.i18n.settings.i18n_api_safemode)
		// 	.onChange(()=>{
		// 		this.i18n.settings.i18n_api_safemode = !this.i18n.settings.i18n_api_safemode;
		// 		this.i18n.saveSettings();
		// 		console.log(`[配置] i18n_web_safemode: ${this.i18n.settings.i18n_api_safemode}`)
		// 	})
		// );
		
		// ==============================
		//         百度翻译API
		// ==============================
		// const baidu = new Setting(containerEl);
		// baidu.setName('百度API');
		// baidu.setDesc('');
		// baidu.addText(text => text
		// 	.setPlaceholder('API')
		// );
		
	}
}
export { I18nSettingTab };

// 按钮 .addButton
		// 颜色拾取器 .addColorPicker	
		// 下拉菜单 .addDropdown
		// 额外按钮 .addExtraButton
		// 时刻格式 .addMomentFormat
		// 进度条 .addProgressBar
		// 搜索 .addSearch
		// 滑块 .addSlider
		// 文本 .addText
		// 文本区域 .addTextArea
		// 切换 .addToggle
		// new Setting(containerEl)
		// 	.setName('更新翻译')
		// 	.setDesc('对当前插件进行更新')
		// 	.addButton((btn) => {
		// 		btn.setButtonText('读取');
		// 		btn.setTooltip('读取文件路径');
		// 		btn.onClick(() => {
		// 			const fileSelector = document.createElement('input');
		// 			fileSelector.setAttribute('type', 'file');
		// 			// fileSelector.setAttribute('multiple', 'multiple');
		// 			fileSelector.setAttribute('directory', '');
		// 			fileSelector.setAttribute('nwdirectory', '');
		// 			// fileSelector.setAttribute('accept', '.svg');
		// 			fileSelector.click() ;
		// 			fileSelector.onchange = (event)=>{
		// 				// const file = event.target.files[0];
		// 				// new Notice(`[语言] ${file.path}`);
		// 			}
		// 		});
		// 	}

		// 		// .onClick(() => {
		// 		// 	const fileSelector = document.createElement('input');
		// 		// 	fileSelector.setAttribute('type', 'file');
		// 		// 	fileSelector.setAttribute('multiple', 'multiple');
		// 		// 	fileSelector.setAttribute('accept', '.svg');
		// 		// 	// fileSelector.click();
		// 		// 	})
		// 		// .setButtonText("翻译")
		// 	);