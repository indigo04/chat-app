import { DataTypes, UUIDV4 } from 'sequelize'
import { client } from '../db.js'

export const Room = client.define('room', {
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
  admin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  users: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'rooms'
})
