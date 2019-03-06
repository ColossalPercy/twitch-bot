let parse = data => {
  if (!data.startsWith('@')) return

  let tagEndAt = data.indexOf(' ')
  let rawTags = data.substr(1, tagEndAt - 1)
  data = data.slice(tagEndAt + 2)
  let msgStartAt = data.indexOf(':')
  let info, channel, msg
  if (msgStartAt > 0) {
    info = data.substr(0, msgStartAt - 1)
    msg = data.substr(msgStartAt + 1)
  } else {
    info = data
  }
  if (info.includes('#')) {
    channel = info.match(/#\w+/)[0].substr(1)
  }

  let command = info.split(' ')[1]
  rawTags = rawTags.split(';')

  let tags = {}
  rawTags.forEach(tag => {
    let pair = tag.split('=')
    pair[0] = pair[0].replace(/-([a-z])/g, g => {
      return g[1].toUpperCase()
    })
    if (pair[0] === 'badges' && pair[1].length > 0) {
      let badges = {}
      let rawBadges = pair[1].split(',')
      rawBadges.forEach(badge => {
        let split = badge.split('/')
        badges[split[0]] = split[1]
      })
      tags.badges = badges
    } else if (pair[0] === 'emotes' && pair[1].length > 0) {
      let emotes = []
      let rawEmotes = pair[1].split('/')
      rawEmotes.forEach(emote => {
        let split = emote.match(/(\d+):(\d+)-(\d+)/)
        emotes.push({
          id: split[1],
          firstIndex: split[2],
          lastIndex: split[3]
        })
      })
      tags.emotes = emotes
    } else if (pair[0] === 'emoteSets' && pair[1].length > 0) {
      tags.emoteSets = pair[1].split(',')
    } else if (pair[0] === 'tmiSentTs') {
      tags[pair[0]] = pair[1]
      tags.tmiSentDate = new Date(parseInt(pair[1]))
    } else {
      tags[pair[0]] = pair[1]
    }
  })

  if (msg) {
    return {
      tags,
      channel,
      command,
      msg
    }
  } else {
    return {
      tags,
      channel,
      command
    }
  }
}

module.exports = parse
