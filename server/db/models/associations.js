const { db } = require('../db');
const User = require('./User');
const Family = require('./Family');
const Allowance = require('./Allowance');
const { Chore, ChoreList } = require('./Chore');
const { Transaction } = require('./Transaction');
const { WishListItem, WishList } = require('./WishListItem');
const { Notification, NotificationList } = require('./Notification');

//associations
User.belongsTo(Family);
Family.hasMany(User);

Notification.belongsTo(Chore);
Chore.hasOne(Notification);

User.hasMany(WishListItem);
WishListItem.belongsTo(User);

User.hasOne(NotificationList);
NotificationList.belongsTo(User);
Notification.belongsTo(NotificationList);
NotificationList.hasMany(Notification);
Notification.belongsTo(User, { as: 'from' });
Notification.belongsTo(User, { as: 'to' });
User.hasMany(Notification);

Chore.belongsTo(ChoreList);
Family.hasOne(ChoreList);
Chore.belongsTo(User);
User.hasMany(Chore);
Chore.belongsTo(Family);
Family.hasMany(Chore);

Transaction.belongsTo(User);
User.hasMany(Transaction);

//export models and db
module.exports = {
  db,
  models: {
    Transaction,
    ChoreList,
    Chore,
    Family,
    User,
    Allowance,
    WishList,
    WishListItem,
    NotificationList,
    Notification,
  },
};
