'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Prets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idDemandeur: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Users',
          key: 'id',
          as: 'idDemandeur'
        }
      },
      idAnnonce: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Annonces',
          key: 'id',
          as: 'idAnnonce'
        }
      },
      idContrat: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Contrats',
          key: 'id',
          as: 'idContrat'
        }
      },
      statut: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Prets');
  }
};