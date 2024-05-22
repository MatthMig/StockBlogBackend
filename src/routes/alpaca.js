const router = require('express').Router()
const { fetchDataBars, fetchDataSymbols } = require('../controllers/alpaca') // Import your Alpaca API functions

const { ALPACA_KEY_ID, ALPACA_SECRET_KEY } = process.env
if (!ALPACA_KEY_ID || !ALPACA_SECRET_KEY) {
  throw new Error('ALPACA_KEY_ID and ALPACA_SECRET_KEY environment variables are required')
}

router.get('/bars/:asset_class/:symbol/:start/:end/:timeframe', async (req, res) => {
  // #swagger.tags = ['Alpaca extern api']
  // #swagger.description = 'Fetch bars data for a given symbol'
  // #swagger.parameters['asset_class'] = { description: 'Asset class (crypto or stocks).', required: true, type: 'string', example: 'stocks' }
  // #swagger.parameters['symbol'] = { description: 'Symbol to fetch data for.', required: true, type: 'string', example: 'AAPL' }
  // #swagger.parameters['start'] = { description: 'Start date/time.', required: true, type: 'string', example: '2022-01-01T00:00:00Z' }
  // #swagger.parameters['end'] = { description: 'End date/time.', required: true, type: 'string', example: '2022-12-31T23:59:59Z' }
  // #swagger.parameters['timeframe'] = { description: 'Timeframe for the data.', required: true, type: 'string', example: '1D' }
  /* #swagger.responses[200] = {
        description: 'Successful operation',
        schema: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        c: { type: 'number', description: 'Close price' },
                        h: { type: 'number', description: 'High price' },
                        l: { type: 'number', description: 'Low price' },
                        n: { type: 'number', description: 'Number of items' },
                        o: { type: 'number', description: 'Open price' },
                        t: { type: 'string', description: 'Time' },
                        v: { type: 'number', description: 'Volume' },
                        vw: { type: 'number', description: 'Volume Weighted Average Price' }
                    }
                }
            }
        },
        examples: {
            'application/json': {
                "ETH/USD": [
                    {
                        "c": 2259.8,
                        "h": 2278.157,
                        "l": 2193.595,
                        "n": 56,
                        "o": 2193.882,
                        "t": "2023-12-21T06:00:00Z",
                        "v": 3.34456539,
                        "vw": 2232.176877203
                    }
                ]
            }
        }
    } */
  const { asset_class: assetClass, symbol, start, end, timeframe } = req.params
  const data = await fetchDataBars(assetClass, symbol, start, end, timeframe, ALPACA_KEY_ID, ALPACA_SECRET_KEY)
  res.json(data)
})

router.get('/symbols', async (req, res) => {
  // #swagger.tags = ['Alpaca extern api']
  // #swagger.description = 'Fetch symbols data'
  /* #swagger.responses[200] = {
        description: 'Successful operation',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Name of the symbol' },
                    symbol: { type: 'string', description: 'Symbol identifier' },
                    class: { type: 'string', description: 'Class of the symbol' }
                }
            }
        },
        examples: {
            'application/json': [
                {
                    "name": "Bitcoin  / US Dollar",
                    "symbol": "BTC%2FUSD",
                    "class": "crypto"
                },
                {
                    "name": "Microsoft Corporation Common Stock",
                    "symbol": "MSFT",
                    "class": "us_equity"
                }
            ]
        }
    } */
  const data = await fetchDataSymbols(ALPACA_KEY_ID, ALPACA_SECRET_KEY)
  res.json(data)
})

module.exports = router
