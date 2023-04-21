const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6067699881:AAGguY2VWfIgY4-dba9lOoS9AmSvYhOpFVo';
const webAppUrl = 'https://astonishing-cactus-05a4f9.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Внизу з`явиться кнопка, заповніть форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповніть форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Наш сайт', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Зробити замовлення', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try{
            const data = JSON.parse(msg?.web_app_data?.data)
            await bot.sendMessage(chatId, 'Дякую за відповідь')
            await bot.sendMessage(chatId, 'Твоя країна - ' + data?.country);
            await bot.sendMessage(chatId, 'Твоє вулиця - ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю інформацію Ви отримаєте в чаті');
            }, 3000)

        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, product, totalPrice} = req.body;

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішна покупка',
            input_message_content: {message_text: 'Вітаю з покупко, товар на суму ' + totalPrice}
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не вдалося купити товар',
            input_message_content: {message_text: 'Не вдалося купити товар'}
        })
        return res.status(500).json({});
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))