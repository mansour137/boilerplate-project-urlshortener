require('dotenv').config();
const {URL} = require('url');
const dns = require('dns');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');


const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb+srv://mansour446:1372001@cluster5.la74xlf.mongodb.net/URL' , { useNewUrlParser: true, useUnifiedTopology: true})

const urlSchema = mongoose.Schema({
  original_url:String,
  short_url:Number,
})

const URLs = mongoose.model('URL' , urlSchema);

// const isValid = (testedURL) => {
//     let ch;
//     const {hostname} = new URL(testedURL);
//     console.log(hostname)
//     dns.lookup(hostname, (err,address) => {
//         if (!address) {
//
//         } else {
//             ch = true;
//         }
//
//     });
// }


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.get('/api/shorturl/:short_url', function(req, res) {
  const short_utl = req.params.short_url;
    URLs.findOne({short_url : short_utl})
      .then((result)=>{
        res.redirect(result.original_url)
      })
});
let num = 0;
app.post('/api/shorturl',  function(req, res) {
  const originUrl = req.body.url;
    const hostname = new URL(originUrl).hostname;
    console.log(hostname)
    dns.lookup(hostname,
        async (err,address , family) => {
            console.log(typeof (address) , family)
        if(address.length !=  14 ){
            res.json({error: 'invalid url'})
        }else{
            ++num;
            const newURL = await new URLs({
                original_url: originUrl,
                short_url: num,
            })
            newURL.save()
                .then(() => {
                    URLs.findOne({short_url: num})
                        .then((result) => {
                            res.json({
                                "original_url": result.original_url,
                                "short_url": result.short_url,
                            })
                        })
                        .catch(() => {
                            res.json({error: 'invalid url'})
                        })
                })
                .catch(() => {
                    res.json({error: 'invalid url'})
                })

        }
    })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
