'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contrat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Contrat.hasMany(models.Proposition,{
        foreignKey: 'idContrat',
        onDelete: 'CASCADE'
      })

    }
  }

  Contrat.init({
    document: DataTypes.BLOB,
    modalitePaiement: DataTypes.STRING,
    signatureCreantier: DataTypes.BLOB,
    signatureDebiteur: DataTypes.BLOB,
  }, {
    sequelize,
    modelName: 'Contrat',
  });
  return Contrat;
};