var express = require('express');
var router = express.Router();
var nexmo = require('nexmo');
nexmo = new nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET,
    applicationId: process.env.APPLICATION_ID,
    privateKey: './private.key'
  }
)

const onInboundCall = (request, response) => {
  const ncco = [{
    action: "record",
    eventUrl: [`${request.protocol}://${request.get('host')}/webhooks/recordings`]
  },
    {
      action: "connect",
      from: "918500878787",
      endpoint: [{
        type: "phone",
        number: "918500008787"
      }]
    }
  ];
  nexmo.calls.create(
    {
      to: [{type: 'phone', number: '918500878787'}],
      from: {type: 'phone', number: '918500878787'},
      ncco,
    },
    (err, result) => {
      console.log(err || result);
    },
  );
  response.json(ncco)
}

const onRecording = (request, response) => {
  const recording_url = request.body.recording_url
  console.log(`Recording URL = ${recording_url}`)
  nexmo.files.save(recording_url, 'test.mp3', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(res);
    }
  });

  response.status(204).send()
}

router
  .get('/webhooks/answer', onInboundCall)
  .post('/webhooks/recordings', onRecording)


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('input', {title: 'Nexmo'});
});

router.post('/webhooks/insight', function (request, response) {
  console.log("params", Object.assign(request.query, request.body));
  response.status(204).send()
});


let verifyRequestId = null;
router.post('/', function (req, res, next) {
  nexmo.numberInsight.get({
      level: 'advancedAsync',
      number: req.body.number,
      callback: ' http://d3dfff0b09fc.ngrok.io/webhooks/insight'
    },
    (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result);
      }
      // res.render('confirmation', { title: 'Nexmo', result: result});
      // res.send(result);
      nexmo.verify.request({
        number: req.body.number,
        brand: "Nexmo"
      }, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          verifyRequestId = result.request_id;
          console.log('request_id', verifyRequestId);
        }
      });
      res.render("code", {title: "Nexmo"});
    });
});

router.post('/verify', function (req, res, next) {
  let code = req.body.code;
  console.log(code);
  nexmo.verify.check({
    request_id: verifyRequestId,
    code: code
  }, (err, result) => {
    if (err) {
      console.error(err);
      res.render('code', {title: "Nexmo"});
    } else {
      console.log(result);
      let ncco = [
        {
          action: 'talk',
          voiceName: 'Joey',
          text:
            'You have successfully registered',
        },
      ];
      ncco = [
        {
          "action": "stream",
          "streamUrl": [
            "https://nexmo-community.github.io/ncco-examples/assets/voice_api_audio_streaming.mp3"
          ]
        }
      ];
      nexmo.calls.create(
        {
          to: [{type: 'phone', number: '918500878787'}],
          from: {type: 'phone', number: '918500878787'},
          ncco,
        },
        (err, result) => {
          console.log(err || result);
        },
      );
      res.render('confirmation', {title: "Nexmo"});
    }
  });

});

module.exports = router;
