const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  res.send('Hey! It works!');
});

router.get('/echoed', (req, res) => {
  if(Object.keys(req.query).length === 0 ){
    res.send('try to send parameters in the url, eg: echoed?param1=value1&param2=value2');
  }
  else{
    res.send(req.query);
  }
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;