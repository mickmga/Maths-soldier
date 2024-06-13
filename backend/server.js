const app = require("express")();
const https = require("https");
const {updateSlotImage, updateSlotData, getSlots} = require("./game");
const express = require("express");

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Change '*' to your domain for better security
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


app.use(express.json());

app.get('/', (req, res) => {
    res.send("thanks");
  })

  app.get('/logos', (req, res) => {
    const options = {
      hostname: 'api.iconfinder.com',
      path: '/v4/icons/search?query=arrow&count=10',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer myToken',
        'Accept': 'application/json'
      }
    };
  
    https.get(options, (apiRes) => {
      let data = '';
  
      // A chunk of data has been received.
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
  
      // The whole response has been received.
      apiRes.on('end', () => {
        console.log("here is the request status code =>");
        console.log(apiRes.statusCode);
        if (apiRes.statusCode === 200) {
          res.json(JSON.parse(data));
        } else {
          res.status(apiRes.statusCode).json({ error: 'Error fetching logos' });
        }
      });
    }).on('error', (e) => {
      console.error(e);
      res.status(500).json({ error: 'Error fetching logos' });
    });
  })

app.get('/slot/update_item', (req, res) => {

  try { 
    console.log("trying to update item")
    updateSlotImage(req.query.slot_id, req.query.src);
   //store it in backend
   res.send("item updated");
   res.status = 200;
  } catch(err){
    res.status = 400;
  }

});

/*
app.get('/icons', async (req, res) => {

  const getLogos = () => {
    return https.get('https://api.iconfinder.com/v4/icons/search?query=arrow&count=10', {
       headers: { 
          'Authorization': 'Bearer X0vjEUN6KRlxbp2DoUkyHeM0VOmxY91rA6BbU5j3Xu6wDodwS0McmilLPBWDUcJ1',
          'accept': 'application/json'
       }
     }
   )
 }

 const logos = await getLogos();
 
 console.log(logos)

 // res.send(logos);
});

*/

app.get('/icons', (req, res) => {
  const options = {
      hostname: 'http://api.iconfinder.com', // Example API
      path: '/v4/icons',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer X0vjEUN6KRlxbp2DoUkyHeM0VOmxY91rA6BbU5j3Xu6wDodwS0McmilLPBWDUcJ1',
        'accept': 'application/json'
       }
  };

  const httpsRequest = https.request(options, (httpsResponse) => {
      let data = '';

      // A chunk of data has been received.
      httpsResponse.on('data', (chunk) => {
          data += chunk;
      });

      // The whole response has been received.
      httpsResponse.on('end', () => {
          try {
              const jsonData = JSON.parse(data);
              res.status(200).json(jsonData);
          } catch (e) {
              res.status(500).send('Error parsing response from external API');
          }
      });
  });

  httpsRequest.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      res.status(500).send('Error with HTTPS request');
  });

  httpsRequest.end();
});



app.get("/slotData", async (req, res) => {

  console.log("getting data")

  try {
    const slots = await getSlots();
    

    res.status = 200;
    res.send(slots);

    console.log("data sent")

  } catch(e){
    console.log("couldnt get slots mb")
    res.status = 400; 
  }

})

app.post('/content', (req, res) => {
  try {
    updateSlotData(req.body.left, req.body.data);
  } catch(e){
    res.status = 400;
  }
  res.status = 200;
  res.send("receiving content");
});

app.post('/login', (req, res) => {
  res.send('logged in');
});

app.post('/register', (req, res) => {
  res.send('registered');
});


app.listen(3000, () => console.log("app running"));