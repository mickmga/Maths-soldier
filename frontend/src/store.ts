import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Item {
  id: string;
  src: string;
  title?: string;
  body?: string;
}

export interface Slot {
  slotId: string;
  item: Item | null;
  data: {
    title: string;
    body: string;
  };
}

export interface Section {
  name: string;
  beginSlotId: string;
  endSlotId: string | null;
}

type LocalStorageState = {
  mapBlocks: Slot[][];
  sections: Section[];
};

const initialState: LocalStorageState = {
  mapBlocks: [
    [
      {
        slotId: "slot_1",
        item: { id: "yyz", src: "assets/palace/items/courage.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_2",
        item: { id: "xxz", src: "assets/palace/items/gamepad.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_3",
        item: { id: "xwz", src: "assets/palace/items/greece.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_4",
        item: { id: "xmz", src: "assets/palace/items/papyrus.png" },
        data: { title: "", body: "" },
      },
      { slotId: "slot_5", item: null, data: { title: "", body: "" } },
    ],
    [
      {
        slotId: "slot_6",
        item: { id: "yyz", src: "assets/palace/items/courage.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_7",
        item: { id: "xxz", src: "assets/palace/items/gamepad.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_8",
        item: { id: "xwz", src: "assets/palace/items/greece.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_9",
        item: { id: "xmz", src: "assets/palace/items/papyrus.png" },
        data: { title: "", body: "" },
      },
      {
        slotId: "slot_10",
        item: { id: "xmz", src: "assets/palace/items/parthenon.png" },
        data: { title: "", body: "" },
      },
    ],
  ],
  sections: [],
};

const localStorageSlice = createSlice({
  name: "localStorage",
  initialState,
  reducers: {
    updateItem: (
      state,
      action: PayloadAction<{
        slotId: string;
        item: Partial<Item>;
      }>
    ) => {
      const { slotId, item } = action.payload;
      const mapBlock = state.mapBlocks.find((map) =>
        map.some((slot) => slot.slotId === slotId)
      );
      if (mapBlock) {
        const slot = mapBlock.find((slot) => slot.slotId === slotId);
        if (slot && slot.item) {
          slot.item = { ...slot.item, ...item };
        }
      }
    },
    addSection: (
      state,
      action: PayloadAction<{ name: string; beginSlotId: string }>
    ) => {
      const { name, beginSlotId } = action.payload;
      state.sections.push({ name, beginSlotId, endSlotId: null });
    },
    updateSection: (
      state,
      action: PayloadAction<{
        name: string;
        beginSlotId: string;
        endSlotId: string;
      }>
    ) => {
      const { name, beginSlotId, endSlotId } = action.payload;
      const section = state.sections.find(
        (section) => section.beginSlotId === beginSlotId
      );
      if (section) {
        section.endSlotId = endSlotId;
      }
    },
    removeSection: (state, action: PayloadAction<{ beginSlotId: string }>) => {
      state.sections = state.sections.filter(
        (section) => section.beginSlotId !== action.payload.beginSlotId
      );
    },
  },
});

export const { updateItem, addSection, updateSection, removeSection } =
  localStorageSlice.actions;

const store = configureStore({
  reducer: {
    localStorage: localStorageSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
