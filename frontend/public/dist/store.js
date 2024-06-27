import { configureStore, createSlice } from "@reduxjs/toolkit";
const initialState = {
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
        updateItem: (state, action) => {
            const { slotId, item } = action.payload;
            const mapBlock = state.mapBlocks.find((map) => map.some((slot) => slot.slotId === slotId));
            if (mapBlock) {
                const slot = mapBlock.find((slot) => slot.slotId === slotId);
                if (slot && slot.item) {
                    slot.item = Object.assign(Object.assign({}, slot.item), item);
                }
            }
        },
        addSection: (state, action) => {
            const { name, beginSlotId } = action.payload;
            state.sections.push({ name, beginSlotId, endSlotId: null });
        },
        updateSection: (state, action) => {
            const { name, beginSlotId, endSlotId } = action.payload;
            const section = state.sections.find((section) => section.beginSlotId === beginSlotId);
            if (section) {
                section.endSlotId = endSlotId;
            }
        },
        removeSection: (state, action) => {
            state.sections = state.sections.filter((section) => section.beginSlotId !== action.payload.beginSlotId);
        },
    },
});
export const { updateItem, addSection, updateSection, removeSection } = localStorageSlice.actions;
const store = configureStore({
    reducer: {
        localStorage: localStorageSlice.reducer,
    },
});
export default store;
