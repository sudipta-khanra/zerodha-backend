const BATCH_SIZE = 5; // stay below limit

for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
  const batch = symbols.slice(i, i + BATCH_SIZE);

  const promises = batch.map(symbol =>
    axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_API_KEY}`)
      .then(res => res.data)
  );

  const results = await Promise.all(promises);

  results.forEach(stock => {
    if (stock.close) {
      allData.push({
        symbol: stock.symbol,
        current: parseFloat(stock.close),
        open: parseFloat(stock.open),
        high: parseFloat(stock.high),
        low: parseFloat(stock.low),
        prevClose: parseFloat(stock.previous_close),
        isDown: parseFloat(stock.close) < parseFloat(stock.previous_close),
      });
    }
  });

  // wait 10 seconds between batches to avoid exceeding 8 requests/min
  await new Promise(resolve => setTimeout(resolve, 10000));
}
