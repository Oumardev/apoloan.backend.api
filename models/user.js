'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.Annonce,{
        foreignKey: 'codeUser',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Transaction,{
        foreignKey: 'idContributeur',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Transaction,{
        foreignKey: 'idEmprunteur',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Proposition,{
        foreignKey: 'idProposant',
        onDelete: 'CASCADE'
      })

      User.belongsTo(models.Compte,{
        foreignKey:'idCompte',
        onDelete: 'CASCADE'
      })
    }
    // toJSON(){
    //   return {...this.get(), password : undefined, id: undefined, idCompte: undefined}
    // }
  }
  User.init({
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    numero: {
      type : DataTypes.INTEGER,
      unique : true
    },
    photo:{
      type : DataTypes.BLOB
    },
    atnaissance: DataTypes.STRING,
    sexe: DataTypes.STRING,
    adresse: DataTypes.STRING,
    isActivated: DataTypes.BOOLEAN,
    fonction: DataTypes.STRING,
    signature: DataTypes.BLOB,
    numeroCNI: {
      type : DataTypes.INTEGER,
      unique : true
    },
    password: DataTypes.STRING,
    idCompte : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};