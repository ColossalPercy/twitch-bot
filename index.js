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
  if (data.msg.startsWith('!')) {
    let command = data.msg.slice(1, data.msg.indexOf(' ') > 0 ? data.msg.indexOf(' ') : data.msg.length).toLowerCase()
    if (command === 'hello') client.send(`Hello ${data.tags.displayName}!`)
  }
})
