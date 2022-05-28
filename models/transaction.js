'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User,{
        foreignKey: 'idContributeur',
        onDelete: 'CASCADE'
      })

      Transaction.belongsTo(models.User,{
        foreignKey: 'idEmprunteur',
        onDelete: 'CASCADE'
      })

      Transaction.belongsTo(models.Annonce,{
        foreignKey: 'idAnnonce',
        onDelete: 'CASCADE'
      })

      Transaction.belongsTo(models.Contrat,{
        foreignKey: 'idContrat',
        onDelete: 'CASCADE'
      })

    }
  }
  Transaction.init({
    idContributeur: DataTypes.INTEGER,
    idEmprunteur: DataTypes.INTEGER,
    idAnnonce: DataTypes.INTEGER,
    idContrat: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};