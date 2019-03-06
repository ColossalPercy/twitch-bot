let Bot = require('./bot')
require('dotenv').config()

let client = new Bot({
  pass: process.env.OAUTH_PASS,
  channels: ['colossalpercy', 'colossalscrub']
})

client.connect().then(() => {
  console.log('wooo')
})

client.on('privmsg', data => {
  console.log(data)
})
