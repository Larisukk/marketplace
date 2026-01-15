import { api } from "./api";

export const adminService = {
    banUser(userId: string) {
        return api.post(`/admin/users/${userId}/ban`);
    },
    unbanUser(userId: string) {
        return api.post(`/admin/users/${userId}/unban`);
    },
};
