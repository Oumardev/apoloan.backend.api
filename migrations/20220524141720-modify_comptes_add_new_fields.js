'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Comptes', // table name
        'idbankaccount', { // new field name
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      )
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      // queryInterface.removeColumn('Users', 'age'),
      //queryInterface.removeColumn('Users', 'twitter'),
    ]);
  },
};
