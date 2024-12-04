import { client } from '../db.js'
import { DataTypes, NOW, UUIDV4 } from 'sequelize'
import { Room } from './Room.js'

export const Message = client.define('message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    defaultValue: NOW,
  },
}, {
  tableName: 'messages'
})

Message.belongsTo(Room)
Room.hasMany(Message)

