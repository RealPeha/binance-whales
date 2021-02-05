const { Telegraf } = require('telegraf')

const WhalesDetector = require('./WhalesDetector')

const bot = new Telegraf(process.env.BOT_TOKEN)

new WhalesDetector(bot.telegram)

bot.catch(err => console.log('GLOBAL ERROR', err))

module.exports = bot
