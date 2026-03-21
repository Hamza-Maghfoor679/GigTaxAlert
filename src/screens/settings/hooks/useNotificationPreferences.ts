import { useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { NotificationCategory, NotificationPreferences } from '../types/settings.types';

const DEFAULT_PREFS: NotificationPreferences = {
    globalEnabled: true, estimated_tax: true, vat: true,
    self_assessment: true, quarterly: true, reminders: true,
};

type UseNotificationPreferencesReturn = {
    prefs: NotificationPreferences;
    permissionStatus: Notifications.PermissionStatus | null;
    isSaving: boolean;
    toggleGlobal: () => Promise<void>;
    toggleCategory: (category: NotificationCategory) => Promise<void>;
};


export function useNotificationPreferences(): UseNotificationPreferencesReturn {
    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
    const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // ✅ Native bridge call — defer until after animations
        const task = InteractionManager.runAfterInteractions(() => {
            Notifications.getPermissionsAsync()
                .then(({ status }) => setPermissionStatus(status))
                .catch(() => { });

            // TODO: load prefs from Supabase here too
        });
        return () => task.cancel();
    }, []);

    const savePrefs = async (updated: NotificationPreferences) => {
        setIsSaving(true);
        try {
            // await supabase.from('notification_preferences').upsert({ ...updated });
            await new Promise((r) => setTimeout(r, 300));
        } finally {
            setIsSaving(false);
        }
    };

    const toggleGlobal = useCallback(async () => {
        if (!prefs.globalEnabled) {
            const { status } = await Notifications.requestPermissionsAsync();
            setPermissionStatus(status);
            if (status !== 'granted') return;
        }
        const updated = { ...prefs, globalEnabled: !prefs.globalEnabled };
        setPrefs(updated);
        await savePrefs(updated);
    }, [prefs]);

    const toggleCategory = useCallback(async (category: NotificationCategory) => {
        const updated = { ...prefs, [category]: !prefs[category] };
        setPrefs(updated);
        await savePrefs(updated);
    }, [prefs]);

    return { prefs, permissionStatus, isSaving, toggleGlobal, toggleCategory };
}