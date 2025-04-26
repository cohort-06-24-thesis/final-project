const express = require('express');
const cors = require('cors');
require("./Database/index.js")


const app=express();
const Port=3000;

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors()) 
const routers = require('./routers');
app.use('/api', routers);


// Start the server
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
  });




