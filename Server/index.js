const express = require('express');
const cors = require('cors');
// require("./Database/index.js")
const routers = require('./routers');


const app=express();
const Port=3000;

app.use(cors()) 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api', routers);


// Start the server
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
  });


  
// app.listen(Port, '0.0.0.0', () => {
//   console.log('Server running...');
// });