const TelegramBot = require("node-telegram-bot-api");
const token = "";
const Bot = new TelegramBot(token, {polling: true});
const users = {};

Bot.on("text", msg => {
    let chat_id = msg.chat.id;
    if (msg.chat.type !== "private") {
        Bot.sendMessage(chat_id, "иди нахрен, только лс");
    } else {
        if (users.hasOwnProperty(chat_id)) {
            if (msg.text.startsWith("/unsub")) {
                Bot.sendMessage(chat_id, "ну и иди нафиг(((");
                delete users[chat_id];
            } else {
                for (let chat_id in users) if (users.hasOwnProperty(chat_id)) {
                    Bot.sendMessage(chat_id, msg.text);
                }
            }
        } else {
            Bot.sendMessage(chat_id, "Добро пожаловать в Мусорки*!\nЧтобы отписаться, напиши /unsub");
            users[chat_id] = {};
        }
    }
});