const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// Get market overview
router.get('/market-overview', async (req, res) => {
  try {
    const symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];
    const promises = symbols.map(symbol => 
      axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
    );
    
    const responses = await Promise.all(promises);
    const stocks = responses.map(response => {
      const data = response.data.chart.result[0];
      const meta = data.meta;
      const quote = data.indicators.quote[0];
      const lastIndex = quote.close.length - 1;
      
      return {
        symbol: meta.symbol,
        companyName: meta.longName || meta.symbol,
        currentPrice: quote.close[lastIndex],
        change: quote.close[lastIndex] - meta.previousClose,
        changePercent: ((quote.close[lastIndex] - meta.previousClose) / meta.previousClose) * 100,
        volume: quote.volume[lastIndex]
      };
    });
    
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search stocks
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search?q=${q}&newsCount=0`);
    
    const stocks = response.data.quotes
      .filter(quote => quote.typeDisp === 'Equity' && (quote.exchange === 'NSI' || quote.exchange === 'BSE'))
      .map(quote => ({
        symbol: quote.symbol,
        companyName: quote.longname || quote.shortname,
        exchange: quote.exchange
      }));
    
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock details
router.get('/details/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    
    const data = response.data.chart.result[0];
    const meta = data.meta;
    const quote = data.indicators.quote[0];
    const lastIndex = quote.close.length - 1;
    
    const stockData = {
      symbol: meta.symbol,
      companyName: meta.longName || meta.symbol,
      currentPrice: quote.close[lastIndex],
      change: quote.close[lastIndex] - meta.previousClose,
      changePercent: ((quote.close[lastIndex] - meta.previousClose) / meta.previousClose) * 100,
      volume: quote.volume[lastIndex],
      high: quote.high[lastIndex],
      low: quote.low[lastIndex],
      open: quote.open[lastIndex],
      previousClose: meta.previousClose,
      marketCap: meta.marketCap
    };
    
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
