import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  sort: {
    id: 0,
    value: "",
  },
  filter: {
    color: [],
    category: [],
    price: null,
    rating: null,
  },
};

export const productSortingFilteringSlice = createSlice({
  name: "sort_filter_products",
  initialState,
  reducers: {
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setColor: (state, action) => {
      state.filter.color = action.payload;
    },
    setCategory: (state, action) => {
      state.filter.category = action.payload;
    },
    setPrice: (state, action) => {
      state.filter.price = action.payload;
    },
    setRating: (state, action) => {
      state.filter.rating = action.payload;
    },
    clearAll: () => {
      return initialState;
    },
  },
});

export const { setSort, setFilter, setCategory, setPrice, clearAll } =
  productSortingFilteringSlice.actions;
