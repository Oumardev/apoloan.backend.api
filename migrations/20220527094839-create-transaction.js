'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idContributeur: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Users',
          key: 'id',
          as: 'idDemandeur'
        }
      },
      idEmprunteur: {
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
      status: {
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
    await queryInterface.dropTable('Transactions');
  }
};