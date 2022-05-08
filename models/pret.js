'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pret extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pret.belongsTo(models.Contrat,{
        foreignKey: 'idContrat',
        onDelete: 'CASCADE'
      })

      Pret.belongsTo(models.User,{
        foreignKey: 'idDemandeur',
        onDelete: 'CASCADE'
      })

      Pret.belongsTo(models.Annonce,{
        foreignKey: 'idAnnonce',
        onDelete: 'CASCADE'
      })

    }
  }
  Pret.init({
    idDemandeur: DataTypes.INTEGER,
    idAnnonce: DataTypes.INTEGER,
    idContrat: DataTypes.INTEGER,
    statut: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pret',
  });
  return Pret;
};