export interface IPushNotificationService {
  initialize(): Promise<void>;
  cleanup(): Promise<void>; // Make async for proper cleanup
  requestPermissions(): Promise<boolean>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
  isServiceInitialized(): boolean; // Add status check
}

export class PushNotificationService implements IPushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized: boolean = false;
  private subscriptions: Set<string> = new Set();

  // Singleton pattern to match usage
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('PushNotificationService already initialized');
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Push notification permissions not granted');
      }

      // TODO: Initialize Firebase messaging or other push notification service
      this.isInitialized = true;
      console.log('PushNotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PushNotificationService:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Properly unsubscribe from all topics
      const unsubscribePromises = Array.from(this.subscriptions).map(topic =>
        this.unsubscribeFromTopic(topic).catch(error =>
          console.error(`Failed to unsubscribe from ${topic}:`, error)
        )
      );

      await Promise.allSettled(unsubscribePromises);

      this.subscriptions.clear();
      this.isInitialized = false;
      console.log('PushNotificationService cleaned up');
    } catch (error) {
      console.error('Error during PushNotificationService cleanup:', error);
      throw error;
    }
  }

  async requestPermissions(): Promise<boolean> {
    // TODO: Implement platform-specific permission requests
    // For now, return true as placeholder
    return Promise.resolve(true);
  }

  private validateTopic(topic: string): void {
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      throw new Error('Topic must be a non-empty string');
    }
  }

  async subscribeToTopic(topic: string): Promise<void> {
    this.validateTopic(topic);

    if (!this.isInitialized) {
      throw new Error('PushNotificationService not initialized');
    }

    if (this.subscriptions.has(topic)) {
      console.warn(`Already subscribed to topic: ${topic}`);
      return;
    }

    try {
      // TODO: Implement actual subscription logic
      this.subscriptions.add(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    this.validateTopic(topic);

    if (!this.isInitialized) {
      throw new Error('PushNotificationService not initialized');
    }

    if (!this.subscriptions.has(topic)) {
      console.warn(`Not subscribed to topic: ${topic}`);
      return;
    }

    try {
      // TODO: Implement actual unsubscription logic
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Static methods to match current usage pattern
  static async initialize(): Promise<void> {
    return PushNotificationService.getInstance().initialize();
  }

  static async cleanup(): Promise<void> {
    return PushNotificationService.getInstance().cleanup();
  }
}
