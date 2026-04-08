type Listener = [
    (...args: any[]) => void | Promise<void>,
    any[]
];
const update_listeners: Listener[] = [];

export function add_update_listener<T extends Array<any>>(listener: (...args: T) => void | Promise<void>, ...args: T) {
    update_listeners.push([listener, args]);
}
export async function broadcast_update() {
    await Promise.all(update_listeners.map(
        listener => (async () => listener[0](listener[1]))()
    ));
}
