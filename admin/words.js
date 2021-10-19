/*global systemDictionary:true */
'use strict';

const dictionary = {
	'tailscale adapter settings': {
		'en': 'Adapter settings for tailscale',
		'de': 'Adaptereinstellungen für tailscale',
		'ru': 'Настройки адаптера для tailscale',
		'pt': 'Configurações do adaptador para tailscale',
		'nl': 'Adapterinstellingen voor tailscale',
		'fr': "Paramètres d'adaptateur pour tailscale",
		'it': "Impostazioni dell'adattatore per tailscale",
		'es': 'Ajustes del adaptador para tailscale',
		'pl': 'Ustawienia adaptera dla tailscale',
		'zh-cn': 'tailscale的适配器设置'
	},
	"Tailscale API access": {
		"en": "Tailscale API access",
		"de": "Tailscale API-Zugriff",
		"ru": "Доступ к Tailscale API",
		"pt": "Acesso à API Tailscale",
		"nl": "Tailscale API-toegang",
		"fr": "Accès à l'API Tailscale",
		"it": "Accesso all'API tailscale",
		"es": "Acceso a la API de Tailscale",
		"pl": "Dostęp do API skali ogonowej",
		"zh-cn": "尾标 API 访问"
	},
	"lc_settings": {
		"en": "adapter settings",
		"de": "Adaptereinstellungen",
		"ru": "настройки адаптера",
		"pt": "configurações do adaptador",
		"nl": "adapter instellingen",
		"fr": "paramètres de l'adaptateur",
		"it": "impostazioni dell'adattatore",
		"es": "configuración del adaptador",
		"pl": "ustawienia adaptera",
		"zh-cn": "适配器设置"
	},
	"lc_forum": {
		"en": "forum",
		"de": "Forum",
		"ru": "Форум",
		"pt": "fórum",
		"nl": "forum",
		"fr": "forum",
		"it": "Forum",
		"es": "foro",
		"pl": "forum",
		"zh-cn": "论坛"
	},
	"User": {
		"en": "User",
		"de": "Benutzer",
		"ru": "пользователь",
		"pt": "Do utilizador",
		"nl": "Gebruiker",
		"fr": "Utilisateur",
		"it": "Utente",
		"es": "Usuario",
		"pl": "Użytkownik",
		"zh-cn": "用户"
	},
	"Password": {
		"en": "Password",
		"de": "Passwort",
		"ru": "Пароль",
		"pt": "Senha",
		"nl": "Wachtwoord",
		"fr": "Mot de passe",
		"it": "Parola d'ordine",
		"es": "Contraseña",
		"pl": "Hasło",
		"zh-cn": "密码"
	},
	"API Key": {
		"en": "API Key",
		"de": "API-Schlüssel",
		"ru": "Ключ API",
		"pt": "Chave API",
		"nl": "API sleutel",
		"fr": "clé API",
		"it": "Chiave API",
		"es": "Clave API",
		"pl": "Klucz API",
		"zh-cn": "API 密钥"
	},
	"pollingInterval": {
		"en": "polling interval",
		"de": "Abfrageintervall",
		"ru": "интервал опроса",
		"pt": "intervalo de pesquisa",
		"nl": "polling interval",
		"fr": "intervalle d'interrogation",
		"it": "intervallo di polling",
		"es": "intervalo de sondeo",
		"pl": "interwał odpytywania",
		"zh-cn": "轮询间隔"
	},
	"enabled": {
		"en": "enabled",
		"de": "aktiviert",
		"ru": "включен",
		"pt": "ativado",
		"nl": "ingeschakeld",
		"fr": "activée",
		"it": "abilitato",
		"es": "habilitado",
		"pl": "włączone",
		"zh-cn": "已启用"
	},
	"Add user": {
		"en": "Add user",
		"de": "Benutzer hinzufügen",
		"ru": "Добавить пользователя",
		"pt": "Adicionar usuário",
		"nl": "Voeg gebruiker toe",
		"fr": "Ajouter un utilisateur",
		"it": "Aggiungi utente",
		"es": "Agregar usuario",
		"pl": "Dodaj użytkownika",
		"zh-cn": "添加用户"
	},
	"Account configuration table": {
		"en": "Account configuration table",
		"de": "Kontokonfigurationstabelle",
		"ru": "Таблица конфигурации учетной записи",
		"pt": "Tabela de configuração de conta",
		"nl": "Accountconfiguratietabel",
		"fr": "Tableau de configuration du compte",
		"it": "Tabella di configurazione dell'account",
		"es": "Tabla de configuración de cuenta",
		"pl": "Tabela konfiguracji konta",
		"zh-cn": "账户配置表"
	},
	"Documentations": {
		"en": "Documentations",
		"de": "Dokumentationen",
		"ru": "Документация",
		"pt": "Documentações",
		"nl": "Documentatie",
		"fr": "Documentation",
		"it": "Documentazioni",
		"es": "Documentaciones",
		"pl": "Dokumentacja",
		"zh-cn": "文档"
	}
};

try {
	// @ts-ignore
	systemDictionary = dictionary;
} catch (ignore) { }

try {
	module.exports = dictionary;
} catch (ignore) { }