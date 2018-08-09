'use strict';
require('dotenv').config()
require('isomorphic-fetch')
var request=require('request');
var rp=require('request-promise');
var logger = require('connect-logger');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var fs = require('fs');
var crypto = require('crypto');
var bodyParser = require("body-parser");
var AuthenticationContext = require('adal-node').AuthenticationContext;

const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(logger());
    server.use(cookieParser('a deep secret'));
    server.use(session({secret: '1234567890QWERTY'}));

    var sampleParameters = {
      tenant : process.env.TENANT,
      authorityHostUrl : process.env.AUTHORITYHOSTURL,
      clientId : process.env.CLIENTID,
      username : process.env.USERNAME,
      clientSecret: process.env.CLIENTSECRET
    };


    var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
    var redirectUri = 'http://localhost:3000/getAToken';
    var resource = 'https://pplsandbox.api.crm4.dynamics.com/';
    //var resource = 'https://polepositionlogistics.api.crm4.dynamics.com/'

    var templateAuthzUrl = 'https://login.windows.net/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';

    function createAuthorizationUrl(state) {
      var authorizationUrl = templateAuthzUrl.replace('<client_id>', sampleParameters.clientId);
      authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
      authorizationUrl = authorizationUrl.replace('<state>', state);
      authorizationUrl = authorizationUrl.replace('<resource>', resource);
      return authorizationUrl;
    }

    server.get('/main', function(req, res) {
      if(req.cookies.authtoken && req.cookies.authstate) {
        return app.render(req, res, '/index', req.query)
      }
      else {
        res.send('Logged out')
      }
    });



    server.get('/', function(req, res) {
      crypto.randomBytes(48, function(ex, buf) {
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');

        res.cookie('authstate', token, {maxAge: 3600000});

        var authorizationUrl = createAuthorizationUrl(token);

        res.redirect(authorizationUrl);
      });
    });

    server.get('/getAToken', function(req, res) {
      if (req.cookies.authstate !== req.query.state) {
        res.send('error: state does not match');
      }
      var authenticationContext = new AuthenticationContext(authorityUrl);
      authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, sampleParameters.clientId, sampleParameters.clientSecret, function(err, response) {
        var message = '';
        if (err) {
          console.log(err.message)
        }
        var thetoken = 'Bearer '+response.accessToken;    
        res.cookie('authtoken', thetoken, {maxAge: 3600000});
        res.redirect('/main')
      });
    });


    server.get('/shipnames', async (req, res) => {
        try {
          let response = await rp({
            method: 'GET',
            url: process.env.API+'/eg_ships?$select=eg_name&$orderby=eg_name&$filter=eg_name%20ne%20%27BERGEN%20VIKING%27',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.cookies.authtoken
            }
           }
          )
          res.status(200).json(response);
        }
        catch(err){
          console.log(err)
        }
    })

    server.post('/darkbrown', async (req, res) => {
        try {     
          let response = await rp({
            method: 'GET',
            url: process.env.API+'/salesorders?$select=salesorderid&$filter=_eg_shipoperatorid_value eq '+req.body.shipoperatorid+' and name eq %27'+req.body.namedate+'%27',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.cookies.authtoken
            }
           }
          )
          
          res.status(200).json(response);
        }
        catch(err){
          console.log(err)
        }
      res.end()
    })
    
    // This one gets a list of ship operators associated with a the date/delivery of the salesorder
    // Note that I don´t say that it´s associated with a shipcall since sometimes shipcalls have a date
    // the day before the actual servicing.
    server.post('/blue', async (req, res) => {
        try {
          let response = await rp({
            method: 'GET',
            url: process.env.API+'/salesorders?$filter=name%20eq%20%27'+req.body.namedate+'%27&$select=_eg_shipoperatorid_value',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.cookies.authtoken
            }
           }
          )

          
          const ship_operator_array = []
           
          for(var i = 0; i < response.value.length; i++) {
              const temp = await rp({
                method: 'GET',
                url: process.env.API+'/eg_shipoperators('+response.value[i]._eg_shipoperatorid_value+')',
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.cookies.authtoken
                }
            
              })
              ship_operator_array.push(temp)
          }


          res.status(200).json(ship_operator_array);
        }
        catch(err){
          console.log(err)
        }

      
      res.end()
    })




    // This one posts to salesorderdetails products such as the bus orders
    server.post('/green', (req, res) => {
      const payload = req.body;
      //console.log(payload);
      const url = process.env.API+'/salesorderdetails'
      //delete outgoing_body.quoteid;
      //console.log(url)

      const options = {
          method: 'POST',
          url: url,
          body: payload,
          json: true,
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': req.cookies.authtoken
          }
      }

      rp(options).then(response => {
          console.log('###');
          
          res.status(204).json(response);
      })
      .catch(function (err) {
          
          console.log(err);
          console.log('ERROR ERROR MAN');
      })
    })

    server.get('/logout', (req, res) => {
      res.clearCookie('authtoken')
      res.clearCookie('authstate')
      res.redirect('https://login.microsoftonline.com/logout.srf')
    })

    server.get('/getuser', async (req, res) => {
      try {
        const response = await rp({
          method: 'GET',
          url: process.env.API+'/WhoAmI',
          json: true,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': req.cookies.authtoken
          }
         }
        )
        
        const userid = response.UserId;

        const user = await rp({
          method: 'GET',
          url: process.env.API+'/systemusers('+userid+')?$select=firstname',
          json: true,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': req.cookies.authtoken
          }
         }
        )
        console.log(user.firstname)
        res.status(200).json(user.firstname);
      }
      catch(err) {
        console.log(err)
      }
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })