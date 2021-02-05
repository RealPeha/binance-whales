require('dotenv').config()

const bot = require('./bot.js')

const run = async () => {
    await bot.launch()
}

run()
