const mongoose = require("mongoose");
const {ObjectId} = require("mongoose");

const {Palace, PalaceRoom, PalaceSlotData, PalaceTemplate, PalaceTemplateRoom, PalaceTemplateElement} = require('./db.js');
const { cp } = require("fs");

mongoose.connect('mongodb://localhost:27017/memory_soldier');

const db = mongoose.connection;

db.once('open', async () => {

 const castleTemplate = await PalaceTemplate.findOne({name: 'Castle'});
 const castleTemplateRoom1 = await PalaceTemplateRoom.findById(castleTemplate.rooms[0]);
 const castleTemplateRoom1elements = [];

 for(let i=0; i < castleTemplateRoom1.elements.length; i++){

  const element = await PalaceTemplateElement.findById(castleTemplateRoom1.elements[i]);
  castleTemplateRoom1elements.push(element);

 }

 const datesPalaces = await Palace.findOne({name: 'datesPalaces'});

 const room = await PalaceRoom.findById(datesPalaces.rooms[0]);
 const dataSlots = [];

  for(let i = 0; i < room.slotDataBlocks.length; i++){

    const slotDataBlock = room.slotDataBlocks[i];
    const slotData = await PalaceSlotData.findById(slotDataBlock);

    dataSlots.push(slotData);
  }

  console.log("ok, we'll try to get the slot corresponding to what we look for =>")

});


const lookForSlot = async (elementObjectId) => {

  const slotData = await PalaceSlotData.find({element_id: elementObjectId.toString()});

  return slotData[0];

}

const findElementByLeft = async (left) => {

  const castleTemplateRoom1elements = await getCastleRoom1Elements();

  for(let i=0; i < castleTemplateRoom1elements.length; i++){

   const element = await PalaceTemplateElement.findById(castleTemplateRoom1elements[i]);

   if(element.coordinates.x_coordinate === left){
     return element;
   }
   
 }

 return null;

}

const getCastleRoom1Elements = async () => {

  const castleTemplate = await PalaceTemplate.findOne({name: 'Castle'});
  const castleTemplateRoom1 = await PalaceTemplateRoom.findById(castleTemplate.rooms[0]);
  const castleRoom1elements = [];
 
  for(let i=0; i < castleTemplateRoom1.elements.length; i++){
 
   const element = await PalaceTemplateElement.findById(castleTemplateRoom1.elements[i]);

   castleRoom1elements.push(element);
 
  }

  return castleRoom1elements;
}


const updateSlotImage = async (left, image) => {

  const elementPicked = await findElementByLeft(`${left}vw`);
  const firstSlot = await lookForSlot(elementPicked._id);
  const slotDataCollection = await db.collection("palaceslotdatas");
  const result = await slotDataCollection.updateOne({_id: firstSlot._id }, { $set: {image, data: {title: "new data block", content: "first piece of memory" }}  });
 
}

const updateSlotData = async (left,data) => {

  const elementPicked = await findElementByLeft(`${left}vw`);
  const firstSlot = await lookForSlot(elementPicked._id);
  const slotDataCollection = await db.collection("palaceslotdatas");
  const result = await slotDataCollection.updateOne({_id: firstSlot._id }, { $set: data  });
   
}


const getSlots = async () => {
   return await PalaceSlotData.find({});
}

module.exports = {updateSlotImage, updateSlotData, getSlots};
