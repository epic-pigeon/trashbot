const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const token = "913804810:AAFxSN8NDv43zOSeI8rFIOpa8bYhWfhuNEk";
const Bot = new TelegramBot(token, {polling: true});
const Users = {
    _users: {},
    _filename: ".user_saves",
    hasOwnProperty(v) {
        return this._users.hasOwnProperty(v);
    },
    addUser(chat_id, obj) {
        this._users[chat_id] = obj;
    },
    deleteUser(chat_id) {
        delete this._users[chat_id];
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
        } catch (e) {}
    }
};

Users.loadFile();

Bot.on("text", msg => {
    let chat_id = msg.chat.id;
    if (msg.chat.type !== "private") {
        Bot.sendMessage(chat_id, "иди нахрен, только лс");
    } else {
        if (Users.hasOwnProperty(chat_id)) {
            if (msg.text.startsWith("/unsub")) {
                Bot.sendMessage(chat_id, "ну и иди нафиг(((");
                Users.deleteUser(chat_id);
            } else {
                Users.forEach((chat_id, user) => {
                    Bot.sendMessage(chat_id, msg.text);
                });
            }
        } else {
            Bot.sendMessage(chat_id, "Добро пожаловать в Мусорки*!\nЧтобы отписаться, напиши /unsub");
            Users.addUser(chat_id, {});
        }
    }
});