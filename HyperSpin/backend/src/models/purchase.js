/* Purchase model */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    itemID: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    status: { type: DataTypes.STRING, defaultValue: 'CREATED' },
    paypalOrderId: { type: DataTypes.STRING },
    raw: { type: DataTypes.JSON },
    grantStatus: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    grantedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
  return Purchase;
};