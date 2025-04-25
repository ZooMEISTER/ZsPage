import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import zh_CN from "./locale/zh_CN.json"
import en_US from "./locale/en_US.json"

export const resources = {
	"zh-CN": {
		translation: zh_CN
	},
	"en-US": {
		translation: en_US
	}
}

i18n
    .use(LanguageDetector)
	// 将 i18n 实例传递给 react-i18next
	.use(initReactI18next)
	// 初始化 i18next
	// 所有配置选项: https://www.i18next.com/overview/configuration-options
	.init({
		resources,
		fallbackLng: "en-US",
		detection: {
			caches: ['localStorage', 'sessionStorage', 'cookie'],
		},
	});

export default i18n;