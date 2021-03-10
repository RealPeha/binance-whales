const dedent = require('dedent')
const WebSocket = require('ws')
const Broadcaster = require('telegraf-broadcast')

class PumpDetector {
    constructor(telegram) {
        this.channels = ['@whales_watch']
        this.broadcaster = new Broadcaster(telegram, {
            queueName: 'whales'
        })

        this.run()
    }
    
    run() {
        const ws = new WebSocket('wss://bstream.binance.com:9443/stream?streams=abnormaltradingnotices')

        ws.on('message', message => {
            let event

            try {
                event = JSON.parse(message)
            } catch (e) {
                event = message
            }

            this.onMarketActivity(event)
        })

        ws.on('error', () => {})
    }

    onMarketActivity(event) {
        const { data: {
            eventType,
            volume,
            baseAsset,
            quotaAsset,
            sendTimestamp
        } = {}} = event || {}

        switch (eventType) {
            case 'BLOCK_TRADES_BUY': {
                const formattedVolume = volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

                return this.broadcastMessages(dedent`
                    🟢 <b>${baseAsset}</b>/${quotaAsset}

                    <b>Large Buy:</b> <code>${formattedVolume} ${baseAsset}</code>
                `)
            }
            case 'BLOCK_TRADES_SELL': {
                const formattedVolume = volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                
                return this.broadcastMessages(dedent`
                    🔴 <b>${baseAsset}</b>/${quotaAsset}

                    <b>Large Sell:</b> <code>${formattedVolume} ${baseAsset}</code>
                `)
            }
        }
    }

    broadcastMessages(message) {
        this.broadcaster.sendText(this.channels, message, { parse_mode: 'HTML' })
    }
}

module.exports = PumpDetector
