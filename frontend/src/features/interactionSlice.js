import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hcpName: '',
  date: '',
  productDiscussed: '',
  outcome: '',
  chatHistory: [],
  isTyping: false,
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    updateMultipleFields: (state, action) => {
      // Sync form with data extracted by LangGraph tools
      Object.keys(action.payload).forEach(key => {
        if (action.payload[key]) {
          state[key] = action.payload[key];
        }
      });
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    }
  },
});

export const { 
  updateFormField, 
  updateMultipleFields, 
  addChatMessage, 
  setTypingStatus 
} = interactionSlice.actions;

export default interactionSlice.reducer;
