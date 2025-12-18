// src/models/client.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define(
    'Client',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('company', 'individual'),
        allowNull: false,
        defaultValue: 'company',
      },
      contact_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isEmail: true },
      },
      contact_phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      billing_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'clients',
      underscored: true,
      timestamps: true,
    }
  );

  return Client;
};
