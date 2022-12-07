const telegraf = require('telegraf')
const config = require('./config')
const data = require('./data')
const mongo = require('mongodb').MongoClient
const urlencode = require('urlencode')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const rateLimit = require('telegraf-ratelimit')
const { createServer } = require('http')
const { text } = config
 http=require("http");
const Server=createServer((req,res)=>{
  res.end("server is running")
})
const bot = new telegraf('5897043349:AAFvl8-Bl7420lyvHNXEoYNlW2a0G8J7QfI', {telegram: {webhookReply: false}})
let db =null

const PRODUCTION = true;
if (PRODUCTION) {
  bot.telegram.setWebhook(`https://p2brefferalbot-api.onrender.com/${data.token}`).then(console.log);
  bot.startWebhook(`/${process.env.BOT_TOKEN}`, null, process.env.PORT);
} else {
  bot.launch()
      .then(() => console.log("Bot Launched"))
      .catch(console.log);
}
const buttonsLimit = {
  window: 1000,
  limit: 1,
  onLimitExceeded: (ctx, next) => {
    if ('callback_query' in ctx.update)
    ctx.answerCbQuery('You`ve pressed buttons too oftern, wait.', true)
      .catch((err) => sendError(err, ctx))
  },
  keyGenerator: (ctx) => {
    return ctx.callbackQuery ? true : false
  }
}
bot.use(rateLimit(buttonsLimit))


mongo.connect(data.mongoLink, {useNewUrlParser: true, }, (err, client) => {
  if (err) {
    sendError(err)
    console.log("error")
  }
  else{
    console.log("mongoDB connect")
  }

  db = client.db('bot')
  bot.startWebhook('/refbot', null, 2104)
 bot.startPolling()
})


const stage = new Stage()
bot.use(session())
bot.use(stage.middleware())

const getNumber = new Scene('getNumber')
stage.register(getNumber)


bot.hears(/^\/start (.+[1-9]$)/, async (ctx) => {
  let tgData = await bot.telegram.getChatMember(data.channel, ctx.from.id) // user`s status on the channel
  let subscribed
  ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
  try {
    subscribed? ctx.reply(
      text.hello + ctx.from.id,
      Extra
      .markup(Markup.inlineKeyboard([
        [Markup.urlButton('📨 Share link', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
        [Markup.callbackButton('💵 ቀሪ ሂሳብ', 'balance'), Markup.callbackButton('📱የኔ ስልክ ቁጥር', 'number')]
      ]))
      .webPreview(false)
    ):ctx.reply(
      
      text.hello + ctx.from.id,
      Extra
      .markup(Markup.inlineKeyboard([
        ctx.reply(
          text.hello + ctx.from.id,
          Extra
          .markup(Markup.inlineKeyboard([
            [Markup.urlButton('📥 በመጀመሪያ የቴሌግራም ቻናላችንን መቀላቀል አለብዎ ', data.chanLink),
          
            ],
            [  Markup.callbackButton('🔄 Restart', 'main')]
          ]))
          .webPreview(false)
        )
       
      ]))
      .webPreview(false)
    )
    
    let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
    if (dbData.length === 0 && ctx.from.id != +ctx.match[1]) {
      db.collection('allUsers').insertOne({userId: ctx.from.id, inviter: +ctx.match[1], virgin: true, paid: false, payments: 0})
    }
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.start(async (ctx) => {
  let tgData = await bot.telegram.getChatMember(data.channel, ctx.from.id) // user`s status on the channel
    let subscribed
    ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
  try {
    subscribed? ctx.reply(
      text.hello + ctx.from.id,
      Extra
      .markup(Markup.inlineKeyboard([
        [ Markup.urlButton('📨 ሰው ለመጋበዝ ', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
        [Markup.callbackButton('💵 ቀሪ ሂሳብ', 'balance'), Markup.callbackButton('📱 የኔ ስልክ ቁጥር', 'number')]
      ]))
      .webPreview(false)
    ):ctx.reply(
      text.hello + ctx.from.id,
      Extra
      .markup(Markup.inlineKeyboard([
        [Markup.urlButton('📥 በመጀመሪያ የቴሌግራም ቻናላችንን መቀላቀል አለብዎ ', data.chanLink),
      
        ],
        [  Markup.callbackButton('🔄 Restart', 'main')]
      ]))
      .webPreview(false)
    )
    let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
    if (dbData.length === 0) {
      db.collection('allUsers').insertOne({userId: ctx.from.id, virgin: true, payments: 0})
    }
  } catch (err) {
    sendError(err, ctx)
  }
})
{
bot.action('main', async (ctx) => {
  let tgData = await bot.telegram.getChatMember(data.channel, ctx.from.id) // user`s status on the channel
    let subscribed
    ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
    try {
      subscribed&& ctx.answerCbQuery()
      subscribed&&ctx.scene.leave('getNumber')
    
      subscribed&&ctx.editMessageText(
        text.hello + ctx.from.id,
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.urlButton('📨 ሰው ለመጋበዝ', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
          [Markup.callbackButton('💵 ቀሪ ሂሳብ', 'balance'), Markup.callbackButton('📱 የኔ ስልክ ቁጥር', 'number')],
        ]))
        .webPreview(false)
      )
      // !subscribed&&ctx.editMessageText(
      //   'You didn`t performed no condition. Collect 1000 {currency} by inviting friends' +
      //   'and subscribe the channel ' + data.chanLink + '',
      //   Extra
      //   .markup(Markup.inlineKeyboard([
      //     [Markup.urlButton('📨 Share link', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
      //     [Markup.urlButton('📥 Subscribe the channel', data.chanLink)],
      //     [Markup.callbackButton('◀️ Back', 'balance')]
      //   ]))
      //   .webPreview(false)
      // )
       
      let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
      if (dbData.length === 0) {
        db.collection('allUsers').insertOne({userId: ctx.from.id, virgin: true, payments: 0})
      }
    } catch (err) {
      sendError(err, ctx)
    }
  
    
})}


bot.action('balance', async (ctx) => {
  try {
    ctx.answerCbQuery()
    let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
    let sum, payments

    if (thisUsersData[0].virgin) {
      sum = notPaid.length * 1 + 1
    } else {
      sum = notPaid.length * 1
    }
    if (thisUsersData[0].payments === 0) {
      payments = ''
    } else {
      payments = '\n ትንሹ ማውጣት የሚችሉት የገንዘብ መጠን : ' + thisUsersData[0].payments
    }
  
    ctx.editMessageText(
      'አሁን ያለዎት ሂሳብ: ' + sum + ' ብር . እስካሁን የጋበዙት ' + allRefs.length + ' ሰው.' + payments,
      Extra
      .markup(Markup.inlineKeyboard([
        [Markup.callbackButton('◀️ Back', 'main'), Markup.callbackButton('💸 ገንዘብዎን ወጭ ለማረግ ', 'withdraw')]
      ]))
    )
      .catch((err) => sendError(err, ctx))
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.action('withdraw', async (ctx) => {
  try {
    ctx.answerCbQuery()
    let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let tgData = await bot.telegram.getChatMember(data.channel, ctx.from.id) // user`s status on the channel
    let subscribed, minSum
    ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
    let thisUsersData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    let sum, friendsLeft
    if (thisUsersData[0].virgin) { // if user hasn`t got gift till
      sum = notPaid.length *1 + 1
      friendsLeft = 10 - notPaid.length
      minSum = 10
    } else {
      sum = notPaid.length * 1
      friendsLeft = 10 - notPaid.length
      minSum = 10
    }

    if (!('number' in thisUsersData[0])) {
      return ctx.editMessageText(
        'እባክዎ ስልክ ቁጥርዎን ያስገቡ.',
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton('◀️ ዋና ገጽ', 'main')],
          [Markup.callbackButton('💵 ቀሪ ሂሳብ', 'balance'), Markup.callbackButton('📱 የኔ ስልክ ቁጥር', 'number')],
        ]))
        .webPreview(false)
      )
      .catch((err) => sendError(err, ctx))
    }

    if (sum >= minSum && subscribed) {
      ctx.editMessageText(
        '✅ ጥያቄዎ በሂደት ላይ ነው በአጭር ጊዜ ውስጥ ስለ ክፍያዎ እናሳውቅዎታለን .', 
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton('◀️ ዋና ገጽ', 'main')]
        ]))
      )
        .catch((err) => sendError(err, ctx))
  
      bot.telegram.sendMessage( // send message to admin
        data.admins[1],
        'New request. \nUser: [' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ')\n' +
        'The sum: ' + sum + ' Birr. \nNumber: ' + thisUsersData[0].number,
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton('✅ Paid', 'paid_' + ctx.from.id)]
        ]))
        .markdown()
      )
        .catch((err) => sendError(err, ctx))
      
      for (let key of notPaid) {
        db.collection('allUsers').updateOne({userId: key.userId}, {$set: {paid: true}}, {upsert: true}) // mark refs as paid
          .catch((err) => sendError(err, ctx))
      }

      db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {virgin: false, payments: thisUsersData[0].payments + sum}}, {upsert: true})
        .catch((err) => sendError(err, ctx))
    } else if (sum >= minSum && !subscribed) {
      ctx.editMessageText(
        'You didn`t subscribe to the channel ' + data.chanLink + '. Make that and press "Withdraw" again.',
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.urlButton('📥 Subscribe የቴሌግራም ቻናችንን ይቀላቀሉ ', data.chanLink)],
          [Markup.callbackButton('◀️ ለመመለስ', 'balance')]
        ]))
        .webPreview(false)
      )
        .catch((err) => sendError(err, ctx))
    } else if (sum < minSum && subscribed) {
      ctx.editMessageText(
        'ያለዎት ሂሳብ : ' + sum + 'ብር ነው ማውጣት የሚችሉት በትንሹ ' + minSum +' ብር ሲሆን ' + 
        'ለማውጣት ተጭማሪ  : ' + friendsLeft + 
        ' ይጋብዙ . \n የእርስዎ መጋበዣ ሊንክ ያጋሩ: t.me/PlacetobeEthiopiabot?start=' + ctx.from.id,
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.urlButton('📨 ሰው ለመጋበዝ', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
          [Markup.callbackButton('◀️ ለመመለስ', 'balance')]
        ]))
        .webPreview(false)
      )
        .catch((err) => sendError(err, ctx))
    } else {
      ctx.editMessageText(
        'ገንዘብዎን ለማውጣት መስፈርቱን አላሟሉም . እባክዎ በመጀመሪያ የእስዎን ሊንክ ለጉዋደኞችዎ በመላክ እና ' +
        'የቴሌግራም ቻናችንን እንዲቀላቀሉ ያድርጉ ' + data.chanLink + '',
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.urlButton('📨 ሰው ለመጋበዝ', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
          [Markup.urlButton('📥 የቴሌግራም ቻናችንን ይቀላቀሉ', data.chanLink)],
          [Markup.callbackButton('◀️ ለመመለስ', 'balance')]
        ]))
        .webPreview(false)
      )
        .catch((err) => sendError(err, ctx))
    }
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.action(/paid_[1-9]/, async (ctx) => {
  try {
    ctx.answerCbQuery()
    let userId = ctx.update.callback_query.data.substr(5)
  
    ctx.editMessageText(ctx.update.callback_query.message.text + '\n\n✅ Paid')
      .catch((err) => sendError(err, ctx))
    bot.telegram.sendMessage(userId, 'ሂሳብዎ ወጪ ሆኗል .')
      .catch((err) => sendError(err, ctx))
  } catch (err) {
    sendError(err, ctx)
  }
})


bot.action('number', async (ctx) => {
  try {
    ctx.answerCbQuery()
    let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
    
    if ('number' in dbData[0]) {
      ctx.editMessageText(
        'የእርስዎ ቁጥር: ' + dbData[0].number + '\n❗️ ገንዘብ የሚያወጡበት በዚህ ስልክ ቁጥር ስለሆነ ልክ መሆኑን እባክዎ ያረጋግጡ ',
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton('◀️ ለመመለስ', 'main'), Markup.callbackButton('🖊 ለማስተካከል', 'get_number')]
        ])) 
        )
          .catch((err) => sendError(err, ctx))
    } else {
      ctx.editMessageText(
        'ስልክዎን አላስገቡም ',
        Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton('◀️ ለመመለስ', 'main'), Markup.callbackButton('🖊ስልክ ቁጥርዎን ለማስገባት...', 'get_number')]
        ]))
      )
        .catch((err) => sendError(err, ctx))
    }
  } catch (err) {
    sendError(err, ctx)
  }
  
})

bot.action('get_number', async (ctx) => {
  try {
    ctx.answerCbQuery()
    ctx.scene.enter('getNumber')
  
    ctx.editMessageText(
      'ስልክ ቁጥርዎን በዚህ ፎርም ያስገቡ +2519********:',
      Extra
      .markup(Markup.inlineKeyboard([
        [Markup.callbackButton('◀️ ስልክ ቁጥርዎን ለማስገባት...', 'number')]
      ]))
      )
        .catch((err) => sendError(err, ctx))
  } catch (err) {
    sendError(err, ctx)
  }
})

getNumber.hears(/^.+251[0-9]{9}$/, async (ctx) => { // replace 998 to your country`s code or turn off regexp
  ctx.reply('የእርስዎ ቁጥር: ' + ctx.message.text,
    Extra
    .markup(Markup.inlineKeyboard([
      [Markup.callbackButton('◀️ ለመመለስ', 'main'), Markup.callbackButton('🖊 ለማስተካከል', 'get_number')]
    ]))
  )
    .catch((err) => sendError(err, ctx))

  db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {number: ctx.message.text}}, {upsert: true})
  .catch((err) => sendError(err, ctx))
  ctx.scene.leave('getNumber')
})


bot.command('getmembers', async (ctx) => {
  if (data.admins.includes(ctx.from.id)) {
    try {
      let dbData = await db.collection('allUsers').find({}).toArray()
      ctx.reply('🌀 All users: ' + dbData.length)
    } catch (err) {
      sendError(err, ctx)
    }
  }
})


async function sendError(err, ctx) {
  console.log(err.toString())
  if (ctx != undefined) {
    if (err.code === 400) {
      return setTimeout(() => {
        ctx.answerCbQuery()
        ctx.editMessageText(
          text.hello + ctx.from.id,
          Extra
          .markup(Markup.inlineKeyboard([
            [Markup.urlButton('📨 ሰው ለመጋበዝ', 't.me/share/url?url=' + urlencode(text.invite + ctx.from.id))],
            [Markup.callbackButton('💵 ቀሪ ሂሳብ', 'balance'), Markup.callbackButton('📱  ስልክ ቁጥር', 'number')],
          ]))
          .webPreview(false)
        )
      }, 500)
    } else if (err.code === 429) {
      return ctx.editMessageText(
        'You`ve pressed buttons too often and were blocked by Telegram' +
        'Wait some minutes and try again'
      )
    }

    bot.telegram.sendMessage(data.admins[0], '[' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ') has got an error.\nError text: ' + err.toString(), {parse_mode: 'markdown'})
  } else {
    bot.telegram.sendMessage(data.admins[0], 'There`s an error:' + err.toString())
  }
}

bot.catch((err) => {
  sendError(err)
})

process.on('uncaughtException', (err) => {
  sendError(err)
})
const port=4000
Server.listen(port, (err)=>{
  if(!err){
    console.log("server is running at "+port)
  }
})