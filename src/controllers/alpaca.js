const axios = require('axios')

async function fetchDataBars (assetClass, symbol, start, end, timeframe, apiKeyID, apiSecretKey) {
  const url = assetClass === 'crypto'
    ? `https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${symbol}&timeframe=${timeframe}&start=${start}&end=${end}`
    : `https://data.alpaca.markets/v2/stocks/${symbol}/bars?start=${start}&end=${end}&timeframe=${timeframe}`

  const options = {
    headers: {
      accept: 'application/json',
      'APCA-API-KEY-ID': apiKeyID,
      'APCA-API-SECRET-KEY': apiSecretKey
    }
  }

  const response = await axios.get(url, options)
  return response.data
}

async function fetchDataSymbols (apiKeyID, apiSecretKey) {
  try {
    const symbolsList = [
      'BTC/USD',
      'ETH/USD',
      'b6d1aa75-5c9c-4353-a305-9e2caa1925ab',
      '69b15845-7c63-4586-b274-1cfdfe9df3d8',
      'NFLX',
      'AMZN',
      '7faa3846-5f48-4abb-92b7-caf8624e6a41',
      'b24553aa-e1ce-4474-88ab-3ddd3f9dfa28'
    ]

    // Fetch data for each symbol and aggregate the responses
    const symbols = []
    for (const symbol of symbolsList) {
      const url = `https://paper-api.alpaca.markets/v2/assets/${symbol}`
      const options = {
        headers: {
          accept: 'application/json',
          'APCA-API-KEY-ID': apiKeyID,
          'APCA-API-SECRET-KEY': apiSecretKey
        }
      }

      const response = await axios.get(url, options)
      const asset = response.data

      symbols.push({
        name: asset.name,
        symbol: encodeURIComponent(asset.symbol),
        class: asset.class
      })
    }

    return symbols
  } catch (error) {
    console.error('Error fetching symbols:', error)
  }
}

module.exports = { fetchDataBars, fetchDataSymbols }
