/*
 Sequelize initialization. Supports Postgres via DATABASE_URL, otherwise sqlite file storage.
*/

const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  const storage = process.env.SQLITE_STORAGE || path.resolve(__dirname, '../../data/dev.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  });
}

const db = {};

db.sequelize = sequelize;

db.User = require('./user')(sequelize);
db.SaveState = require('./savestate')(sequelize);
db.Purchase = require('./purchase')(sequelize);

// Associations
// User 1 - 1 SaveState
db.User.hasOne(db.SaveState, { foreignKey: 'userId', as: 'saveState' });
db.SaveState.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User 1 - N Purchase
db.User.hasMany(db.Purchase, { foreignKey: 'userId', as: 'purchases' });
db.Purchase.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;