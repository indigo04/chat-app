import { client } from '../db.js'
import { DataTypes, UUIDV4 } from 'sequelize'


export const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users'
})

