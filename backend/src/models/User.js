// src/models/user.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(3), // EUR, MAD, USD...
        allowNull: false,
        defaultValue: 'EUR',
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tax_id: {
        type: DataTypes.STRING(100), // SIRET / ICE / TVA
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
