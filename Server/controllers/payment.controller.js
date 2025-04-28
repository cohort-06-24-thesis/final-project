const axios = require('axios');



module.exports = {
  Add: async (req, res) => {
    const url= "https://developers.flouci.com/api/generate_payment"
    const payload= {
      "app_token": "3072bc87-6e35-4250-b54e-0e2ebf0f3f82", 
      "app_secret": process.env.FLOUCI_SECRET,
      "amount":req.body.amount,
      "accept_card": "true",
      "session_timeout_secs": 2200,
      "success_link": "http://localhost:3000/success",
      "fail_link": "http://localhost:3000/fail",
      "developer_tracking_id": "735e9bdb-8e06-4396-95f1-32dd31069e83"
  }
    await axios
    .post(url, payload)
     .then(result => {
      res.send(result.data)
     })
     .catch(err => console.log(err))
  },
 verify: async (req,res) =>{
  const payment_id=req.params.id;
  await axios.get(`https://developers.flouci.com/api/verify_payment/${payment_id}`,{
    headers: {
      'Content-Type':'application/json',
      'apppublic':'3072bc87-6e35-4250-b54e-0e2ebf0f3f82',
      'appsecret':process.env.FLOUCI_SECRET
    }
  })
  .then(result => {
    res.send(result.data)
 })
 .catch(err => {
  console.log(err.message)
 })
}
}  ;  