var express = require('express');
var router = express.Router();
var nexmo = require('nexmo');
nexmo = new nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
  }
)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('input', { title: 'Nexmo' });
});

router.post('/webhooks/insight', function (request, response) {
  console.log('jfsoidfj')
  console.log("params", Object.assign(request.query, request.body))
  response.status(204).send()
});

router.post('/', function(req, res, next) {
  nexmo.numberInsight.get({
    level: 'advancedAsync',
    number: req.body.number,
    callback: ' http://d3dfff0b09fc.ngrok.io/webhooks/insight'
  }, (error, result) => {
    if(error) {
      console.error(error);
    }
    else {
      console.log(result);
    }
    // res.render('confirmation', { title: 'Nexmo', result: result});
    res.send(result);
  });
});
module.exports = router;
