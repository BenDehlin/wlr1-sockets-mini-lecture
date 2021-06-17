require("dotenv").config()
const express = require("express")
const app = express()
const { SERVER_PORT } = process.env
app.use(express.json())


// const socketio = require('socket.io')
// const io = socketio(3334, {cors: {origin: true}})
// app.listen(SERVER_PORT, () => console.log(`Listening on ${SERVER_PORT}`))

// Here I alter my app.listen a little bit to take advantage of
//  the fact that app.listen() will return the port it's 
// listening on and I can use the same port for both
const io = require("socket.io")(
  app.listen(SERVER_PORT, () => console.log(`Listening on ${SERVER_PORT}`)),
  { cors: { origin: true } }
)


// Here we set up our socket.io to listen for a new client to 
// "connect". When that socket connects it will set up all of
// the endpoints within this callback function for that socket.

io.on('connection', (socket) => {
  // We console log the socket connecting
  console.log(`Socket ${socket.id} connected`)
  // The first endpoint we set up is a built in one 
  // for disconnect.
  // In our case we just console log that the socket disconnected.
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`)
  })
  // The second endpoint we set up is the say-hi endpoint, if a
  // connected user hits this endpoint it will simply console log
  // hello world in nodemon. Go look in ../src/Components/Chat.js
  // and find where we emit "say-hi" to see what hitting this
  // endpoint on the other side is.
  socket.on('say-hi', () => {
    console.log('hello world')
  })
  // This endpoint is set up to expect a body. We console log the
  // body to see what's inside it but you can also go look in
  // ../src/Components/Chat.js file to see what we put inside
  // of the body. it will look something like this
  // socket.emit('send-message', 
  // {message: 'some message', username: 'some username'})
  socket.on('send-message', (body) => {
    console.log(body)
    // Here we take the body we received from the user and send it
    // to all other users that are connected to our server.
    io.emit('relay-message', body)
  })
  // This endpoint is just to join a specified room that is passed
  // back on a body. This will allow us to emit things to a
  // specific room. Notice how when someone joins the room we emit
  // to all the users in that room that someone joined.
  socket.on('join-room', (body) => {
    socket.join(body.roomId)
    io.to(body.roomId).emit('relay-join-room', body)
  })
})