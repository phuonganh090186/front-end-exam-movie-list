import { Action, configureStore, ThunkAction,  createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface AppState {
    localStorageChangeTime?: number;
}

const initialState: AppState = {
    localStorageChangeTime: 0,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setLocalStorageChangeTime: (state: AppState, action: PayloadAction<number>) => {
            state.localStorageChangeTime = action.payload;
        },
    },
});

export const { setLocalStorageChangeTime} =
    appSlice.actions;

function makeStore() {
    return configureStore({
        reducer: {
            app: appSlice.reducer,
        },
    });
}

const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;
