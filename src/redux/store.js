import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice';
import specialOfferReducer from './slices/specialOfferSlice';
import flashDealReducer from './slices/flashDealSlice';
import reviewReducer from './slices/reviewSlice';
import uiReducer from './slices/uiSlice';
import heroReducer from './slices/heroSlice';
import expenseReducer from './slices/expenseSlice';
import salesReducer from './slices/salesSlice';

// ✅ persist config for auth only
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth'],
};

// combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  orders: orderReducer,
  categories: categoryReducer,
  users: userReducer,
  dashboard: dashboardReducer,
  specialOffers: specialOfferReducer,
  flashDeals: flashDealReducer,
  reviews: reviewReducer,
  ui: uiReducer,
  hero: heroReducer,
  expenses: expenseReducer,
  sales: salesReducer,
});

// wrap persisted reducer (only auth will persist)
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;