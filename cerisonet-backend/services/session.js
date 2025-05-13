const MongoStore = require('connect-mongo');
module.exports.sessionOptions = {
    secret: 'MaSession',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb://pedago01C.univ-avignon.fr:27017/db-CERI',
      collectionName: 'MySession3139'
    }),
    cookie: { secure: true }
  };