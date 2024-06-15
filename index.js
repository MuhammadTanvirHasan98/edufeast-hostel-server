const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = 5000 || process.env.PORT;

//middlewares
app.use(cors())
app.use(express.json());


app.get('/', (req, res)=>{
   res.send("EduFeast Hostel server is running here!")
})

app.listen(port, ()=>{
   console.log(`My EduFeast Hostel app is listening on port: ${port}`);
})