import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Item {
  id: string;
  src: string;
}

type LocalStorageState = Array<Array<Item | null>>;

const initialState: LocalStorageState = [
  [
    { id: "yyz", src: "assets/palace/items/courage.png" },
    { id: "xxz", src: "assets/palace/items/gamepad.png" },
    { id: "xwz", src: "assets/palace/items/greece.png" },
    { id: "xmz", src: "assets/palace/items/papyrus.png" },
    null,
  ],
  [
    { id: "yyz", src: "assets/palace/items/courage.png" },
    { id: "xxz", src: "assets/palace/items/gamepad.png" },
    { id: "xwz", src: "assets/palace/items/greece.png" },
    { id: "xmz", src: "assets/palace/items/papyrus.png" },
    { id: "xmz", src: "assets/palace/items/parthenon.png" },
  ],
  // Repeat similar structure for other blocks...
];

const localStorageSlice = createSlice({
  name: "localStorage",
  initialState,
  reducers: {
    updateItem: (
      state,
      action: PayloadAction<{
        blockIndex: number;
        itemIndex: number;
        item: Item | null;
      }>
    ) => {
      const { blockIndex, itemIndex, item } = action.payload;
      if (state[blockIndex]) {
        state[blockIndex][itemIndex] = item;
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
