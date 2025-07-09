import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer, PersistConfig} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from 'redux-persist';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';
// Import your slice reducers
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import mapSlice from './slices/mapSlice';

// Root reducer configuration
const rootReducer = combineReducers({
	auth: authSlice.reducer,
	user: userSlice.reducer,
	map: mapSlice.reducer,
});

// Type definitions (moved before usage)
type RootState = ReturnType<typeof rootReducer>;
type AppDispatch = typeof store.dispatch;

// Store configuration interface
interface StoreConfiguration {
	readonly persistKey: string;
	readonly persistedReducers: readonly string[];
	readonly nonSerializableActions: readonly string[];
	readonly enableDebug: boolean;
}

// Configuration constants
const STORE_CONFIG: StoreConfiguration = {
	persistKey: 'root',
	persistedReducers: ['auth', 'user'] as const,
	nonSerializableActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
	enableDebug: __DEV__,
} as const;

// Persist configuration factory
const createPersistConfig = (config: StoreConfiguration): PersistConfig<RootState> => ({
	key: config.persistKey,
	storage: AsyncStorage,
	whitelist: config.persistedReducers,
	debug: config.enableDebug,
});

// Middleware configuration factory
const createMiddlewareConfig = (config: StoreConfiguration) => ({
	serializableCheck: {
		ignoredActions: config.nonSerializableActions,
	},
});

// Store setup
const persistConfig = createPersistConfig(STORE_CONFIG);
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware(createMiddlewareConfig(STORE_CONFIG)),
});

export const persistor = persistStore(store);

// Export types
export type {RootState, AppDispatch};

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
