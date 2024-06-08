const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Define PalaceTemplate schema
const PalaceTemplateSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: String,
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: 'PalaceTemplateRoomSchema'
  }]
});

const PalaceTemplateRoomSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    image:String,
    elements: [{
      type: Schema.Types.ObjectId,
      ref: 'PalaceTemplateElementSchema'
     }
    ],
  }
);

const PalaceRoomSchema = new Schema({
   _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
   },
   template_room_id: {
    type: Schema.Types.ObjectId,
    ref: 'PalaceTemplateRoomSchema'
   },
   name:String,
   slotDataBlocks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PalaceSlotDataSchema'
    }
   ]
})

// Define PalaceSession schema
const PalaceSessionSchema = new Schema({
  name: String,
  currentRoomIndex: Number,
  rooms: [
    {
      slots: [{
        palace_slot_id: {
          type: Schema.Types.ObjectId,
          ref: 'PalaceTemplate.rooms.slots'
        },
        found: Boolean
      }]
    }
  ]

});

// Define Palace schema
const PalaceSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: String,
  template_id: {
    type: Schema.Types.ObjectId,
    ref: 'PalaceTemplateSchema'
  },
  rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PalaceRoomSchema'
    }
  ]
});


const PalaceTemplateElementSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    type: String,
    coordinates: {
      x_coordinate: String,
      y_coordinate: String,
    },
    size: {
      height_in_tile: String,
      width_in_tile: String,
    }
  }
);

const PalaceSlotDataSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    element_id: {
      type: Schema.Types.ObjectId,
      ref: 'PalaceTemplateElementSchema'
    },
    image: String,
    data: {
      title: String,
      content: String
    }
  }
);

const PalaceItemsInventorySchema = new Schema({
  items: [{
    type: Schema.Types.ObjectId,
   ref: ''
  }]
 }
);

const PalaceItemSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: String,
    src: String
  }
);

const UserSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: String,
    password: String,
    palaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PalaceSchema'
      }
    ]
  }
);

const User = mongoose.model('User', UserSchema);
const PalaceTemplate = mongoose.model('PalaceTemplate', PalaceTemplateSchema);
const PalaceTemplateRoom = mongoose.model('PalaceTemplateRoom', PalaceTemplateRoomSchema);
const PalaceTemplateElement = mongoose.model('PalaceTemplateElement', PalaceTemplateElementSchema);
const PalaceSlotData = mongoose.model('PalaceSlotData', PalaceSlotDataSchema);
const Palace = mongoose.model('Palace', PalaceSchema);
const PalaceItem = mongoose.model('PalaceItem', PalaceItemSchema);
const PalaceItemsInventory = mongoose.model('PalaceItemsInventory', PalaceItemsInventorySchema)
const PalaceRoom = mongoose.model('PalaceRoom', PalaceRoomSchema);

module.exports = {PalaceTemplate, PalaceTemplateRoom, PalaceTemplateElement, Palace, PalaceRoom, PalaceSlotData, PalaceItem, PalaceItemsInventory, User};