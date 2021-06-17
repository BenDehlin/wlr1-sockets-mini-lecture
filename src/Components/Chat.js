import {useState, useEffect} from 'react'
import io from 'socket.io-client'

const Chat = (props) => {
  // We're keeping track of 4 pieces of state here, the socket,
  // a mesage (input field), a messages array, and a roomId 
  // (another input field)
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    // When our component first loads we want to connect the
    // socket and then save our socket to state. 
    // When the component unmounts we want to disconnect 
    // the socket and set the value on state back to null.
      // setSocket(io.connect("", {username: 'ben'}))
      setSocket(io.connect())
      return () => {
        socket.disconnect()
        setSocket(null)
      }
  }, [])

  useEffect(() => {
    // Here if our socket connection exists then we set up 
    // endpoints that listen for the various things our 
    // server io emits.
    if(socket){
      socket.on('relay-message', (body) => {
        console.log(body)
        // to make sure our setMessages setState function gets
        // the current messages value we pass it an arrow function
        // with the currentMessages as a parameter. This trick
        // allows us to get past a quirk in react where functions
        //  only know what the values on state are when the
        // function started running and don't automatically get
        // updated values of state until a rerender happens.
        // This means the callback function for the socket.on does
        // not have the correct value for the messages state.
        // We get around this by using the callback 
        // function which will go get our state value, 
        // whatever it is, and then update the state 
        // according to what we return from the function.
        setMessages((currentMessages) => [...currentMessages, body])
      })
      // this socket just console logs when a user joins a room
      // that we are also in.
      socket.on('relay-join-room', (body) => {
        console.log(`${body.username} has joined ${body.roomId}`)
      })
    }
  }, [socket])
  // Here we've defined a function that will emit say-hi when
  // we click a button down below. All this does on the server
  // is console log hello world in nodemon.
  const sayHi = () => {
    socket.emit('say-hi')
  }
  // Here we've defined a function that will take the message value from state (the input field) and 
  // send it back in a body with a username of Ben so 
  // the server can send that message to everyone.
  const sendMessage = () => {
    socket.emit('send-message', {message, username: "Ben"})
  }

  // Here we emit a roomId (that we're pulling from the
  // input field above ) so that the server will add our
  // user to that room.
  const joinRoom = () => {
    socket.emit('join-room', {roomId, username: 'Ben'})
  }
  return(
    <div>
      <input value={roomId} onChange={e => setRoomId(e.target.value)} />
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={sayHi}>Say Hi</button>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send Message</button>
      {messages.map((body) => (
        <div>
          {body.username}: {body.message}
        </div>
      ))}
    </div>
  )
}

export default Chat