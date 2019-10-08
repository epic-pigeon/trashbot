const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const token = "913804810:AAFxSN8NDv43zOSeI8rFIOpa8bYhWfhuNEk";
const Bot = new TelegramBot(token, {polling: true});
const limit = 30;
const time = 60 * 1000;
const Users = {
    _users: {},
    _filename: ".user_saves",
    hasOwnProperty(v) {
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

Users.loadFile();

Bot.on("text", msg => {
    let chat_id = msg.chat.id;

    if (msg.chat.type !== "private") {
        Bot.sendMessage(chat_id, "иди нахрен, только лс");
    } else {
        if (Users.hasOwnProperty(chat_id)) {
            let user = Users.getUser(chat_id);
            if (msg.text.startsWith("/unsub")) {
                Bot.sendMessage(chat_id, "ну и иди нафиг(((");
                Users.deleteUser(chat_id);
            } else {
                if (user.timestamp + time < +Date.now()) {
                    user.timestamp = +Date.now();
                    user.msg_count = 0;
                }
                if (user.msg_count > limit) {
                    Bot.sendMessage(chat_id, "ты отправил слишком много сообщений, жди еще " + (+Date.now() - user.timestamp) / 1000 + " секунд");
                } else {
                    Users.forEach((user_chat_id, current_user) => {
                        if (user_chat_id != chat_id) {
                            let options = {};
                            if (typeof msg.reply_to_message === "object") {
                                console.log(msg.reply_to_message);
                                options.reply_to_message_id = msg.reply_to_message.message_id;
                            }
                            Bot.sendMessage(user_chat_id, msg.text, options);
                        }
                    });
                }
            }
        } else {
            if (msg.text.startsWith("/start")) {
                Bot.sendMessage(chat_id, "Добро пожаловать в Мусорки*!\nЧтобы отписаться, напиши /unsub");
                Users.addUser(chat_id, {
                    timestamp: +Date.now(),
                    msg_count: 0,
                });
            } else {
                Bot.sendMessage(chat_id, "Вы либо не подписаны, либо отписались.\nОтправьте /start чтобы подписаться");
            }
        }
    }
});