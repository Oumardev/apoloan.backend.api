'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Proposition extends Model {
    static associate(models) {
      Proposition.belongsTo(models.User,{
        foreignKey: 'idProposant',
        onDelete: 'CASCADE'
      })

      Proposition.belongsTo(models.Annonce,{
        foreignKey: 'idAnnonce',
        onDelete: 'CASCADE'
      })

    }
  }
  Proposition.init({
    idProposant: DataTypes.INTEGER,
    idAnnonce: DataTypes.INTEGER,
    status : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Proposition',
  });
  return Proposition;
};