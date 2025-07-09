import * as React from 'react';
import {useEffect, useState, useCallback, useRef, useMemo} from 'react';
import {View, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from '../../store/store';
import {RootState} from '../../store/store';
import {updateUserLocation, fetchNearbyUsers} from '../../store/slices/mapSlice';
import {LocationService} from '../../services/location/LocationService';
import UserDot from '../../components/map/UserDot';
import {User} from '../../types/index';

const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
const DEFAULT_RADIUS = 5000; // 5km

// Default region (consider making this configurable)
const DEFAULT_REGION: Region = {
	latitude: 37.78825,
	longitude: -122.4324,
	latitudeDelta: 0.0922,
	longitudeDelta: 0.0421,
};

// Custom hook for location management
const useLocationManager = (user: any) => {
	const dispatch = useDispatch<AppDispatch>();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);
	const abortControllerRef = useRef<AbortController | null>(null);

	const [region, setRegion] = useState<Region>(DEFAULT_REGION);
	const [isInitializing, setIsInitializing] = useState(true);
	const [locationError, setLocationError] = useState<string | null>(null);

	const updateLocation = useCallback(async (): Promise<void> => {
		if (!user || !mountedRef.current) return;

		try {
			const location = await LocationService.getCurrentLocation();
			if (!mountedRef.current) return;

			await (dispatch as any)(updateUserLocation(location)).unwrap();
			await (dispatch as any)(fetchNearbyUsers({
				latitude: location.latitude,
				longitude: location.longitude,
				radius: DEFAULT_RADIUS
			})).unwrap();

			setLocationError(null);
		} catch (error) {
			console.error('Location update failed:', error);
			setLocationError(error instanceof Error ? error.message : 'Failed to update location');
		}
	}, [user, dispatch]);

	const initializeLocation = useCallback(async (): Promise<void> => {
		if (!mountedRef.current) return;

		setIsInitializing(true);
		setLocationError(null);

		try {
			const hasPermission = await LocationService.requestLocationPermission();
			if (!hasPermission) {
				Alert.alert(
					'Location Permission Denied',
					'Location access is required to show nearby users. Please enable it in settings.',
					[{text: 'OK', style: 'default'}]
				);
				setLocationError('Location permission denied');
				return;
			}

			const location = await LocationService.getCurrentLocation();
			if (!mountedRef.current) return;

			const newRegion: Region = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			};

			setRegion(newRegion);
			await (dispatch as any)(updateUserLocation(location)).unwrap();
			await (dispatch as any)(fetchNearbyUsers({
				latitude: location.latitude,
				longitude: location.longitude,
				radius: DEFAULT_RADIUS
			})).unwrap();
		} catch (error) {
			console.error('Location initialization error:', error);
			if (mountedRef.current) {
				const errorMessage = error instanceof Error ? error.message : 'Unable to initialize location services';
				setLocationError(errorMessage);
				Alert.alert(
					'Location Error',
					errorMessage,
					[{text: 'OK'}]
				);
			}
		} finally {
			if (mountedRef.current) {
				setIsInitializing(false);
			}
		}
	}, [dispatch]);

	// Initialize location when user is available
	useEffect(() => {
		mountedRef.current = true;
		if (user) {
			initializeLocation();
		}
		return () => {
			mountedRef.current = false;
			const abortController = abortControllerRef.current;
			if (abortController) {
				abortController.abort();
			}
		};
	}, [user, initializeLocation]);

	// Setup location update interval
	useEffect(() => {
		if (!user || !mountedRef.current) return;

		intervalRef.current = setInterval(() => {
			if (mountedRef.current && user) {
				updateLocation();
			}
		}, LOCATION_UPDATE_INTERVAL);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [user, updateLocation]);

	return {
		region,
		setRegion,
		isInitializing,
		locationError,
	};
};

// Remove duplicate RootState import and custom hook, use useSelector with RootState directly


const MapScreen: React.FC = () => {
	const user = useSelector((state: RootState) => state.auth.user);
	const nearbyUsers = useSelector((state: RootState) => state.map.nearbyUsers);
	const isLoading = useSelector((state: RootState) => state.map.isLoading);

	const {region, setRegion, isInitializing} = useLocationManager(user);
	// Replace with your navigation logic, e.g. using React Navigation
	const navigateToUserProfile = useCallback((userId: string) => {
		// Example: navigation.navigate('UserProfile', { userId });
		console.log('Navigate to user profile:', userId);
	}, []);

	const navigateToChat = useCallback((userId: string) => {
		// Example: navigation.navigate('Chat', { userId });
		console.log('Navigate to chat:', userId);
	}, []);

	const handleUserPress = useCallback((selectedUser: User) => {
		if (!selectedUser?.id) {
			console.warn('Selected user has no ID');
			return;
		}
		Alert.alert(
			selectedUser.name || 'Unknown User',
			'What would you like to do?',
			[
				{text: 'View Profile', onPress: () => navigateToUserProfile(selectedUser.id)},
				{text: 'Send Message', onPress: () => navigateToChat(selectedUser.id)},
				{text: 'Cancel', style: 'cancel'}
			]
		);
	}, [navigateToUserProfile, navigateToChat]);

	// Memoize markers with better type checking
	const markers = useMemo(() => {
		if (!Array.isArray(nearbyUsers)) {
			return [];
		}
		return nearbyUsers
			.filter((nearbyUser: any): nearbyUser is User & { latitude: number; longitude: number } =>
				typeof nearbyUser?.latitude === 'number' &&
				typeof nearbyUser?.longitude === 'number' &&
				nearbyUser.id
			)
			.map((nearbyUser) => (
				<Marker
					key={nearbyUser.id}
					coordinate={{
						latitude: nearbyUser.latitude,
						longitude: nearbyUser.longitude,
					}}
					onPress={() => handleUserPress(nearbyUser)}
				>
					<UserDot user={nearbyUser}/>
				</Marker>
			));
	}, [nearbyUsers, handleUserPress]);

	if (isInitializing) {
		return (
			<View style={[styles.container, styles.centered]}>
				<ActivityIndicator size="large" color="#007AFF"/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<MapView
				style={styles.map}
				region={region}
				onRegionChangeComplete={setRegion}
				showsUserLocation={true}
				showsMyLocationButton={true}
			>
				{markers}
			</MapView>
			{isLoading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="small" color="#007AFF"/>
				</View>
			)}
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingOverlay: {
		position: 'absolute',
		top: 50,
		right: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		padding: 10,
		borderRadius: 5,
	},
});

export default MapScreen;
