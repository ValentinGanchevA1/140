import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  PersistConfig,
  createTransform
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FLUSH, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER, 
  REHYDRATE 
} from 'redux-persist';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import slice reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import mapReducer from './slices/mapSlice';

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;

// Root reducer configuration
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  map: mapReducer,
});

// Type definitions
export type RootState = ReturnType<typeof rootReducer>;

// Configuration constants
const PERSIST_CONFIG = {
  KEY: 'root',
  VERSION: 1,
  PERSISTED_REDUCERS: ['auth', 'user'] as const,
  NON_SERIALIZABLE_ACTIONS: [
    FLUSH, 
    REHYDRATE, 
    PAUSE, 
    PERSIST, 
    PURGE, 
    REGISTER
  ] as const,
} as const;

// Error handling transform
const errorTransform = createTransform<any, any, RootState>(
  // Transform state on its way to being serialized and persisted
  (inboundState) => inboundState,
  // Transform state being rehydrated
  (outboundState) => {
    try {
      return outboundState;
    } catch (error) {
      console.warn('Redux persist rehydration error:', error);
      return undefined;
    }
  }
);

// State migration handler
const createMigration = (state: any): Promise<any> => {
  // Handle state migrations between app versions
  if (!state) return Promise.resolve(state);
  
  try {
    // Add migration logic here for future versions
    return Promise.resolve(state);
  } catch (error) {
    console.warn('Redux persist migration error:', error);
    return Promise.resolve(undefined);
  }
};

// Persist configuration
const persistConfig: PersistConfig<RootState> = {
  key: PERSIST_CONFIG.KEY,
  storage: AsyncStorage,
  version: PERSIST_CONFIG.VERSION,
  whitelist: PERSIST_CONFIG.PERSISTED_REDUCERS as unknown as string[],
  transforms: [errorTransform],
  migrate: createMigration,
  debug: __DEV__,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: PERSIST_CONFIG.NON_SERIALIZABLE_ACTIONS.slice(),
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Type definitions (after store creation)
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Store utilities
export const clearPersistedState = (): void => {
  persistor.purge();
};

export const getPersistedState = (): RootState => {
  return store.getState();
};

// Type exports for slice usage
// (Removed duplicate export to avoid conflicts)