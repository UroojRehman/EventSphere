const clients = new Map();

export const addRealtimeClient = (userId, response) => {
    const key = userId.toString();
    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(response);
    return () => {
        const userClients = clients.get(key);
        userClients?.delete(response);
        if (userClients?.size === 0) clients.delete(key);
    };
};

export const emitRealtime = (userId, payload) => {
    const userClients = clients.get(userId.toString()) || [];
    for (const response of userClients) response.write(`data: ${JSON.stringify(payload)}\n\n`);
};