let EventEmitter = require('events')
let net = require('net')
let parse = require('./parse')

class Bot extends EventEmitter {
  constructor (config) {
    super()
    this.pass = config.pass
    this.initChannels = config.channels
    this.joinedChannels = {}
  }

  connect () {
    this.socket = new net.Socket()
    this.socket.connect(
      6667,
      'irc.chat.twitch.tv'
    )

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        this.listen()
        console.log('Connected to irc.chat.twitch.tv:6667!')

        this.send('CAP', 'tags')
        this.send('CAP', 'commands')
        this.send('PASS', this.pass)
        this.send('NICK', null)

        if (typeof this.initChannels === 'object') {
          this.initChannels.forEach(channel => {
            this.join(channel)
          })
        } else {
          this.join(this.initChannels)
        }
        resolve()
      })
    })
  }

  listen () {
    this.socket.on('close', () => {
      console.log('Connection to irc.chat.twitch.tv:6667 closed!')
    })
    this.socket.on('data', data => {
      data = data.toString()
      if (data.startsWith('PING')) {
        console.log('Sending PONG ', new Date().toISOString())
        this.send('PONG')
      } else {
        data = data.split('\r\n').filter(line => line.length > 0)
        data.forEach(line => {
          line = parse(line)
          if (line) {
            this.emit(line.command.toLowerCase(), line)
          }
        })
      }
    })
    this.socket.on('error', err => {
      console.error(err)
    })
    this.on('roomstate', data => {
      this.joinedChannels[data.channel] = data.tags
    })
  }

  send (type, data, channel) {
    let msg
    if (type === 'NICK') msg = `NICK ${data}\r\n`
    if (type === 'PASS') msg = `PASS ${data}\r\n`
    if (type === 'PONG') msg = 'PONG :tmi.twitch.tv\r\n'
    if (type === 'CAP') msg = `CAP REQ :twitch.tv/${data}\r\n`
    if (type === 'JOIN') msg = `JOIN #${data}\r\n`
    if (type === 'PART') msg = `PART #${data}\r\n`
    if (type === 'PRIVMSG') msg = `PRIVMSG #${channel} :${data}\r\n`
    if (type === 'CUSTOM') msg = `${data}\r\n`
    this.socket.write(msg)
  }

  join (channel) {
    this.send('JOIN', channel)
  }

  part (channel) {
    this.send('PART', channel)
  }
}

module.exports = Bot
