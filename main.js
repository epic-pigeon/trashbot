const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const process = require('process');
const token = (process.argv.length > 2 && process.argv[2] === "test" ? "733814090:AAHqhsI0nUVu593DVxeUOvRNwRLuqJrNIT4" : "913804810:AAFxSN8NDv43zOSeI8rFIOpa8bYhWfhuNEk");
const Bot = new TelegramBot(token, {polling: true});
const limit = 20;
const time = 60 * 1000;

const version = "0.0.3";
const patchNotes = Object.freeze({
    "0.0.1": "Первый релиз",
    "0.0.2": "Добавлен парсер комманд",
    "0.0.3": "Добавлена возможность отправлять фото",
});

const Users = {
    _users: {},
    _filename: ".user_saves",
    hasUser(v) {
        return this._users.hasOwnProperty(v);
    },
    addUser(chat_id, obj) {
        this._users[chat_id] = obj;
        this.saveFile();
    },
    deleteUser(chat_id) {
        delete this._users[chat_id];
        this.saveFile();
    },
    getUser(chat_id) {
        return this._users[chat_id];
    },
    forEach(func) {
        for (let chat_id in this._users) if (this._users.hasOwnProperty(chat_id)) {
            func(chat_id, this.getUser(chat_id));
        }
    },
    saveFile() {
        fs.writeFile(this._filename, JSON.stringify(this._users), {}, err => {
            if (err) console.log(err);
        });
    },
    loadFile() {
        try {
            this._users = JSON.parse(fs.readFileSync(this._filename, {}).toString());
        } catch (e) {
        }
    }
};

function getUserWrapperId(user, msg_id) {
    for (let prop in user.reply_table) if (user.reply_table.hasOwnProperty(prop)) {
        if (user.reply_table[prop] == msg_id) return prop;
    }
    return null;
}

Users.loadFile();

function stringFromUser(user) {
    let result = user.user_data.first_name + " ";
    if (user.user_data.last_name) result += user.user_data.last_name + " ";
    if (user.user_data.username) result += "@" + user.user_data.username + " ";
    return result;
}

const CommandProcessor = new (require("./commandprocessor")) ([
    {
        name: "members",
        description: "перечисляет ЧЛЕНОВ ахахвхавхах(все очень плохо)",
        adminOnly: false,
        usage: "/members",
        action: function (msg, user, arguments, self) {
            let result = "";
            let i = 1;
            Users.forEach((chat_id, user) => {
                result += i + ") " + stringFromUser(user) + "\n";
                i++;
            });
            Bot.sendMessage(user.chat_id, result, {
                reply_to_message_id: msg.message_id
            });
        }
    },
    {
        name: "unsub",
        description: "раньше было лучше дизлайк отписка",
        adminOnly: false,
        usage: "/unsub",
        action: function (msg, user, arguments, self) {
            Bot.sendMessage(user.chat_id, "ну и иди нафиг(((", {
                reply_to_message_id: msg.message_id
            });
            Users.deleteUser(user.chat_id);
        }
    },
    {
        name: "help",
        description: "нахрена тебе помощь по помощи???",
        adminOnly: false,
        usage: "/help command?",
        action: function (msg, user, arguments, self) {
            if (arguments.length === 0) {
                let string = 'Все команды:\n\t';
                let commandNames = [];
                self.commands.forEach(command => {
                    if ((!command.adminOnly) || user.is_admin) commandNames.push(command.name)
                });
                string += commandNames.join('\n\t');
                Bot.sendMessage(user.chat_id, string, {
                    reply_to_message_id: msg.message_id
                });
            } else if (arguments.length > 0) {
                let command = arguments[0].value;
                let commandObject = undefined;
                self.commands.forEach(comm => {
                    if (comm.name === command.toLowerCase()) commandObject = comm;
                });
                if (typeof commandObject === "undefined" || (commandObject.adminOnly && !user.is_admin)) throw {message: "команды \"" + command + "\" не существует"};
                let string = "Название команды: " + commandObject.name + "\nОписание команды: " + commandObject.description + "\nИспользование: `" + commandObject.usage + "`" + (commandObject.adminOnly ? "\nТолько для админов!" : "");
                Bot.sendMessage(user.chat_id, string, {
                    reply_to_message_id: msg.message_id,
                    parse_type: "markdown"
                });
            }
        }
    },
    {
        name: "get_admin",
        description: "введите пароль для получения админки",
        adminOnly: false,
        usage: "/get_admin 'password'",
        action: function (msg, user, arguments, self) {
            if (arguments.length === 1) {
                let pass = arguments[0].value;
                if (pass.startsWith("kar")) {
                    Bot.sendMessage(user.chat_id, "бля как ты угадал...\nнафиг иди, думаешь я настолько тупой??", {
                        reply_to_message_id: msg.message_id
                    });
                } else if (pass === "dima pidor") {
                    Bot.sendMessage(user.chat_id, "согласен", {
                        reply_to_message_id: msg.message_id
                    });
                } else if (pass === "sosiska_homyaka") {
                    user.is_admin = true;
                    Bot.sendMessage(user.chat_id, "готово, вы админ!", {
                        reply_to_message_id: msg.message_id
                    });
                } else {
                    Bot.sendMessage(user.chat_id, "неверный пароль: '" + pass + "'", {
                        reply_to_message_id: msg.message_id
                    });
                }
            }
        }
    },
    {
        name: "deanonymize",
        description: "",
        adminOnly: true,
        usage: "/deanonymize",
        action: function (msg, user, arguments, self) {
            user.deanon = true;
            Bot.sendMessage(user.chat_id, "готово, вы видите всех!", {
                reply_to_message_id: msg.message_id
            });
        }
    },
    {
        name: "check_admin",
        description: "проверка на петуха",
        adminOnly: false,
        usage: "/check_admin",
        action: function (msg, user, arguments, self) {
            Bot.sendMessage(user.chat_id, "вы " + (user.is_admin ? "" : "не ") + "админ", {
                reply_to_message_id: msg.message_id
            });
        }
    },
    {
        name: "disable_admin",
        description: "",
        adminOnly: true,
        usage: "/disable_admin",
        action: function (msg, user, arguments, self) {
            user.is_admin = false;
            Bot.sendMessage(user.chat_id, "готово, вы больше не админ!", {
                reply_to_message_id: msg.message_id
            });
        }
    },
    {
        name: "anonymize",
        description: "",
        adminOnly: true,
        usage: "/anonymize",
        action: function (msg, user, arguments, self) {
            user.deanon = false;
            Bot.sendMessage(user.chat_id, "готово, вы ни о ком не знаете!", {
                reply_to_message_id: msg.message_id
            });
        }
    },
    {
        name: "new_member_notification",
        description: "уведомление о новых бомжах",
        adminOnly: false,
        usage: "/new_member_notification true/false",
        action: function (msg, user, arguments, self) {
            if (arguments.length === 1) {
                user.new_member_notification = arguments[0].value;
                Bot.sendMessage(user.chat_id, "настройки изменены!", {
                    reply_to_message_id: msg.message_id
                });
            }
        }
    }
]);

function checkCanSend(msg) {
    let chat_id = msg.chat.id;

    if (msg.chat.type !== "private") {
        Bot.sendMessage(chat_id, "иди нахрен, только лс");
        return false;
    } else {
        if (Users.hasUser(chat_id)) {
            let user = Users.getUser(chat_id);
            if (user.timestamp + time < +Date.now()) {
                user.timestamp = +Date.now();
                user.msg_count = 0;
            }
            if (user.msg_count > limit) {
                Bot.sendMessage(chat_id, "ты отправил слишком много сообщений, жди еще " + (user.timestamp + time - Date.now()) / 1000 + " секунд");
                return false;
            } else {
                user.msg_count++;
                return true;
            }
        } else {
            if (msg.text.startsWith("/start")) {
                Bot.sendMessage(chat_id, "Добро пожаловать в Мусорки*!\nЧтобы отписаться, напиши /unsub");
                Users.addUser(chat_id, {
                    timestamp: +Date.now(),
                    msg_count: 0,
                    reply_table: {},
                    user_data: msg.chat,
                    chat_id: chat_id,
                    is_admin: false,
                });
                Users.forEach((user_chat_id, current_user) => {
                    if (current_user.new_member_notification) {
                        Bot.sendMessage(user_chat_id, "присоединился новый бомж " + stringFromUser(Users.getUser(chat_id)));
                    }
                });
                return true;
            } else {
                Bot.sendMessage(chat_id, "Вы либо не подписаны, либо отписались, либо прошло большое обновление.\nОтправьте /start чтобы подписаться");
                return false;
            }
        }
    }
}

Bot.on("text", msg => {
    if (checkCanSend(msg)) {
        let chat_id = msg.chat.id;
        let user = Users.getUser(chat_id);
        if (msg.text.startsWith("/start")) {} else
        if (msg.text.startsWith("/")) {
            try {
                CommandProcessor.process(msg.text.slice(1), msg, user);
            } catch (e) {
                Bot.sendMessage(chat_id, "Ошибка: " + e.message, {
                    reply_to_message_id: msg.message_id
                });
            }
        } else {
            Users.forEach((user_chat_id, current_user) => {
                if (user_chat_id != chat_id) {
                    let options = {};
                    if (typeof msg.reply_to_message === "object") {
                        //console.log(user.reply_table);
                        //console.log(current_user.reply_table);
                        //console.log(msg.reply_to_message);
                        options.reply_to_message_id = getUserWrapperId(current_user,
                            user.reply_table[msg.reply_to_message.message_id]
                        ) || user.reply_table[msg.reply_to_message.message_id] || getUserWrapperId(current_user,
                            msg.reply_to_message.message_id);
                        if (!options.reply_to_message_id) delete options.reply_to_message_id;
                    }
                    Bot.sendMessage(user_chat_id,
                        (current_user.deanon && current_user.is_admin ? stringFromUser(user) + "\n" : "") + msg.text
                        , options).then(r => {
                        //console.log("sent message:");
                        //console.log(r);
                        current_user.reply_table[r.message_id] = msg.message_id;
                    }).catch(e => {
                        console.log(e);
                        if (e.body.description === "Forbidden: bot was blocked by the user") {
                            Bot.sendMessage(user_chat_id, "ты заблочил бота, иди нахрен");
                            Users.deleteUser(user_chat_id);
                        }
                    });
                }
            });
        }
    }
});
Bot.on("photo", msg => {
    if (checkCanSend(msg)) {
        let chat_id = msg.chat.id;
        let user = Users.getUser(chat_id);

        let file_id = msg.photo[0].file_id;

        Users.forEach((user_chat_id, current_user) => {
            if (user_chat_id != chat_id) {
                let options = {};
                if (typeof msg.reply_to_message === "object") {
                    //console.log(user.reply_table);
                    //console.log(current_user.reply_table);
                    //console.log(msg.reply_to_message);
                    options.reply_to_message_id = getUserWrapperId(current_user,
                        user.reply_table[msg.reply_to_message.message_id]
                    ) || user.reply_table[msg.reply_to_message.message_id] || getUserWrapperId(current_user,
                        msg.reply_to_message.message_id);
                    if (!options.reply_to_message_id) delete options.reply_to_message_id;
                }
                options.caption = (current_user.deanon && current_user.is_admin ? stringFromUser(user) + "\n" : "") + (msg.caption ? msg.caption : "");
                if (options.caption === "") delete options.caption;
                /*Bot.sendMessage(user_chat_id,
                    (current_user.deanon && current_user.is_admin ? stringFromUser(user) + "\n" : "") + msg.text
                    , options).then(r => {
                    //console.log("sent message:");
                    //console.log(r);
                    current_user.reply_table[r.message_id] = msg.message_id;
                });*/
                Bot.sendPhoto(
                    user_chat_id,
                    file_id,
                    options
                ).then(r => {
                    //console.log("sent message:");
                    //console.log(r);
                    current_user.reply_table[r.message_id] = msg.message_id;
                }).catch(e => {
                    console.log(e);
                    if (e.body.description === "Forbidden: bot was blocked by the user") {
                        Bot.sendMessage(user_chat_id, "ты заблочил бота, иди нахрен");
                        Users.deleteUser(user_chat_id);
                    }
                });
            }
        });
    }
});