const mongoose = require('mongoose');

const {PalaceTemplate, PalaceTemplateRoom, PalaceTemplateElement, Palace, PalaceRoom, PalaceSlotData} = require('./db');

// Set up default mongoose connection
const mongoDB = 'mongodb://localhost:27017/memory_soldier';
mongoose.connect(mongoDB);

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Bind connection to open event (to get notification of successful connection)
db.once('open', async function () {
   console.log("the db is opened");

   const {room1, castlePalaceTemplate} = await generateCastleTemplate();

   const datesPalaceRoom1 = await new PalaceRoom(
    {
      name: 'dpr1',
      template_room_id: room1.id,
      slotDataBlocks: await generateCastleSlotsDataBlocks(room1.elements)
    }
   ).save();

   const datesPalace = await new Palace({
    name: 'datesPalaces',
    template_id: castlePalaceTemplate.id,
    rooms: [datesPalaceRoom1.id]
   }).save();
});


const createElement = (x) => {

  const element = new PalaceTemplateElement({
    type: 'Slot',
    coordinates: {
      x_coordinate: x,
      y_coordinate: 4,
    },
    size: {
      height_in_tile: 2,
      width_in_tile: 1,
    }
  })

  return element;
}

const generateCastleRoom1elements = async () => {


  const elements = [];

  //1

  const element1 = createElement('7.5vw');

  await element1.save();

  elements.push(
    element1.id
  )


  //2

  const element2 = createElement('27.5vw');

  await element2.save();

  elements.push(
    element2.id
  )

  
  //3

  const element3 = createElement('50.5vw');

  await element3.save();

  elements.push(
    element3.id
  )


  //4

  const element4 = createElement('72.5vw');

  await element4.save();

  elements.push(
    element4.id
  )


  //5

  const element5 = createElement('87.5vw');

  await element5.save();

  elements.push(
    element5.id
  )


  //6

  const element6 = createElement('100vw');

  await element6.save();

  elements.push(
    element6.id
  )


  //7

  const element7 = createElement('125vw');

  await element7.save();

  elements.push(
    element7.id
  )    

  //8

  const element8 = createElement('150vw');

  await element8.save();

  elements.push(
    element8.id
  )

  //9

  const element9 = createElement('175vw');

  await element9.save();

  elements.push(
    element9.id
  )


  //10

  const element10 = createElement('200vw');

  await element10.save();

  elements.push(
    element10.id
  )

  //11

  const element11 = createElement('225vw');

  await element11.save();

  elements.push(
    element11.id
  )


  //12
  const element12 = createElement('250vw');

  await element12.save();

  elements.push(
    element12.id
  )

  //13

  const element13 = createElement('275vw');

  await element13.save();

  elements.push(
    element13.id
  )


  //14

  const element14 = createElement('300vw');

  await element14.save();

  elements.push(
    element14.id
  )


  //15

  const element15 = createElement('325vw');

  await element15.save();

  elements.push(
    element15.id
  )

  return elements;

}

const generateCastleTemplate = async () => {

  const room1 = await new PalaceTemplateRoom({
    image: 'assets/maps/castle/1024x576/backgroundLevel1.png',
    elements: await generateCastleRoom1elements()
  }
  ).save();

  const castlePalaceTemplate = await new PalaceTemplate({
    name: 'Castle',
    rooms: [room1.id]
  }).save()

  return {room1, castlePalaceTemplate};
  
}

const generateCastleSlotsDataBlocks = async (templateElements) => {
 
    const slotsDataBlocks = [];

    for(let i = 0; i < templateElements.length; i++){

      const templateEl = templateElements[i];

      const slotData = await new PalaceSlotData(
        {
          element_id: templateEl,
          image: "assets/items/courage.png"
        }
      ).save();

      slotsDataBlocks.push(
        slotData
      );

    }

    return slotsDataBlocks;
}
