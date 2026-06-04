import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase listener limit for micro-service event triggers
    this.setMaxListeners(20);
  }

  // Helper to publish events safely
  publish(eventName, payload) {
    console.log(`[Event Published] -> "${eventName}"`, JSON.stringify(payload, null, 2));
    this.emit(eventName, payload);
  }

  // Helper to subscribe to events
  subscribe(eventName, handler) {
    this.on(eventName, async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`[Event Error] in listener for "${eventName}":`, err.message);
      }
    });
  }
}

const appEvents = new AppEventEmitter();
export default appEvents;
