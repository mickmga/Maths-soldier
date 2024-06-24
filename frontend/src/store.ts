import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Item {
  id: string;
  src: string;
}

export interface Slot {
  slotId: string;
  item: Item | null;
}

type LocalStorageState = MapBlock[];

type MapBlock = Slot[];

const initialState: LocalStorageState = [
  [
    {
      slotId: "slot_1",
      item: { id: "yyz", src: "assets/palace/items/courage.png" },
    },
    {
      slotId: "slot_2",
      item: { id: "xxz", src: "assets/palace/items/gamepad.png" },
    },
    {
      slotId: "slot_3",
      item: { id: "xwz", src: "assets/palace/items/greece.png" },
    },
    {
      slotId: "slot_4",
      item: { id: "xmz", src: "assets/palace/items/papyrus.png" },
    },
    { slotId: "slot_5", item: null },
  ],
  [
    {
      slotId: "slot_6",
      item: { id: "yyz", src: "assets/palace/items/courage.png" },
    },
    {
      slotId: "slot_7",
      item: { id: "xxz", src: "assets/palace/items/gamepad.png" },
    },
    {
      slotId: "slot_8",
      item: { id: "xwz", src: "assets/palace/items/greece.png" },
    },
    {
      slotId: "slot_9",
      item: { id: "xmz", src: "assets/palace/items/papyrus.png" },
    },
    {
      slotId: "slot_10",
      item: { id: "xmz", src: "assets/palace/items/parthenon.png" },
    },
  ],
];

const localStorageSlice = createSlice({
  name: "localStorage",
  initialState,
  reducers: {
    updateItem: (
      state,
      action: PayloadAction<{
        slotId: string;
        item: Item | null;
      }>
    ) => {
      const { slotId, item } = action.payload;
      for (let map of state) {
        const slot = map.find((slot) => slot.slotId === slotId);
        if (slot) {
          slot.item = item;
          return;
        }
      }
    },
  },
});

export const { updateItem } = localStorageSlice.actions;

const store = configureStore({
  reducer: {
    localStorage: localStorageSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
