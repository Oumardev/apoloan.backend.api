'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'atnaissance', { // new field name
          type: Sequelize.DATE,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'Users',
        'isActivated', // new field name
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
      )
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('Users', 'age'),
      //queryInterface.removeColumn('Users', 'twitter'),
    ]);
  },
};
