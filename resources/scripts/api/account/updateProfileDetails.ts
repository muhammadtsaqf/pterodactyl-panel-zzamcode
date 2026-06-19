import http from '@/api/http';

export default async (data: Record<string, string | undefined>): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put('/api/client/account/profile', data)
            .then(() => resolve())
            .catch(reject);
    });
};
