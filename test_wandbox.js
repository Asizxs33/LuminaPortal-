const https = require('https');

https.get('https://wandbox.org/api/list.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const compilers = JSON.parse(data);
      const pythons = compilers.filter(c => c.language === 'Python');
      console.log('Available Python compilers:');
      pythons.slice(0, 5).forEach(c => console.log(c.name));
    } catch (e) {
      console.error(e);
    }
  });
});
