const Discord= require("discord.js")
const fetch = require("node-fetch")
const keepAlive =require("./server")
const Database = require("@replit/database")

const client= new Discord.Client()
const db = new Database()

const sadWords=["sad","depressed","unhappy","feeling down","pissed","angry","depression"]

const initEncouragements=[
  "Cheer up !",
  "It's okay, reality is like this sometimes. But remember to feel better.",
  "I know this sucks, but you don't deserve to live like this. Be Happy !",
  "Hang in there, buddy!",
  "sheesh! relax."
]

db.get("encouragements").then(encouragements =>{
  if(!encouragements || encouragements<1){
    db.set("encouragements",initEncouragements)
  }
})

db.get("responding").then(value =>{
  if(value == null){
    db.set("responding",true)
  }
})

function updateEncouragements(encouragingMessage){
  db.get("encouragements").then(encouragements =>{
    encouragements.push([encouragingMessage])
    db.set("encouragements",encouragements)
  })
}

function deleteEncouragements(index){
  db.get("encouragements").then(encouragements =>{
    if(encouragements.length>index){
      encouragements.splice(index,1)
      db.set("encouragements",encouragements)
    }
  })
}

function getQuote(){
  return fetch("https://zenquotes.io/api/random")
  .then( res =>{
    return res.json()
  })
  .then( data =>{
    return data[0]["q"]+" -"+data[0]["a"]
  })
}


client.on("ready", ()=>{
  console.log(`logged in as ${client.user.tag}!`)
})

// creating an information command

client.on("message", msg=>{
  if(msg.author.bot) return

  if(msg.content ==="s-info"){
    msg.reply("Hi, I am Spring+ve Bot created by Mezin. My sole purpose is to keep the channels in server Positive. I am gonna respond to sad messages with  a positive message. Right now I am in a developing stage so my commands are limited.\r\nMy commands are:\r\n1.s-info: My informaton and commands\r\n2.s-inspire: to get an inspirational quote.\r\n3.s-new +[message]: to add a new Message in the Encouraging message list\r\n4.s-del [index]: to delete the message at that index\r\n5.s-list: to list all the messages.\r\n6.s-respond [true/false]: to turn on/off the auto response to the sad messages.\r\n7.")
  }
})

client.on("message", msg => {
  if(msg.author.bot) return

  if(msg.content === "s-inspire"){
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding =>{
    if(responding && sadWords.some(word => msg.content.includes(word))){
    db.get("encouragements").then(encouragements =>{
      const encourage = encouragements[Math.floor(Math.random()* encouragements.length)]
      msg.reply(encourage)
    })
  }
  })
  

  if(msg.content.startsWith("s-new")){
    encouragingMessage=msg.content.split("s-new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New Message Recorded")
  }

  if(msg.content.startsWith("s-del")){
    delIndex= parseInt(msg.content.split("s-del ")[1])
    deleteEncouragements(delIndex)
    msg.channel.send(`Message at index ${delIndex} is deleted!`)
  }

  if(msg.content.startsWith("s-list")){
    
    db.get("encouragements").then(encouragements =>{
      msg.channel.send(encouragements)
    })
  }

  if(msg.content.startsWith("s-respond")){
    value=msg.content.split("s-respond ")[1]

    if(value.toLowerCase() == 'true'){
      db.set("responding", true)
      msg.channel.send("Auto Response is turned On!")
    }
    else if(value.toLowerCase() =='false'){
      db.set("responding", false)
      msg.channel.send("Auto Response is turned Off")
  }
    else{
      msg.channel.send("Invalid Request!")
    }
  }

})

keepAlive()
const mySecret = process.env['TOKEN']
client.login(mySecret)