import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Bell,
    Megaphone,
    ArrowRight,
    ExternalLink,
    CheckCircle2,
    Sparkles,
} from 'lucide-react-native';
import { apiFetch } from '../../constants/api';
import { BroadcastItem } from '../../components/broadcasts/TopAlertBar';

interface UserNotification {
    id: string | number;
    type: string;
    title: string;
    subtitle?: string;
    payload?: any;
    read: boolean;
    timestamp: string;
    href?: string;
}

export default function NotificationsScreen() {
    const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
    const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'broadcasts'>('all');

    const fetchData = useCallback(async () => {
        try {
            const [bRes, nRes] = await Promise.allSettled([
                apiFetch('/api/broadcasts'),
                apiFetch('/api/notifications'),
            ]);

            if (bRes.status === 'fulfilled' && bRes.value.ok) {
                const bData = await bRes.value.json();
                if (bData?.broadcasts) {
                    setBroadcasts(bData.broadcasts);
                }
            }

            if (nRes.status === 'fulfilled' && nRes.value.ok) {
                const nData = await nRes.value.json();
                if (nData?.notifications) {
                    setUserNotifications(nData.notifications);
                }
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handlePressLink = (link?: string | null) => {
        if (!link || link === '#') return;

        if (link.startsWith('http://') || link.startsWith('https://')) {
            Linking.openURL(link).catch(() => {});
        } else if (link === '/listings/create' || link === '/sell') {
            router.push('/sell' as any);
        } else if (link === '/deals') {
            router.push('/deals' as any);
        } else if (link.startsWith('/listings/') || link.startsWith('/item/')) {
            const id = link.split('/').filter(Boolean).pop();
            if (id) router.push(`/listings/${id}` as any);
        } else {
            router.push(link as any);
        }
    };

    const totalCount = broadcasts.length + userNotifications.length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#4F46E5' }} edges={['top']}>
            {/* Header */}
            <LinearGradient
                colors={['#4F46E5', '#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.header}
            >
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Notifications</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                {/* Filter Tabs */}
                <View style={s.tabBar}>
                    <TouchableOpacity
                        style={[s.tabItem, activeTab === 'all' && s.tabItemActive]}
                        onPress={() => setActiveTab('all')}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.tabText, activeTab === 'all' && s.tabTextActive]}>
                            All ({totalCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.tabItem, activeTab === 'broadcasts' && s.tabItemActive]}
                        onPress={() => setActiveTab('broadcasts')}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.tabText, activeTab === 'broadcasts' && s.tabTextActive]}>
                            📢 Announcements ({broadcasts.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={s.centerLoading}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={s.loadingText}>Loading notifications & announcements...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={activeTab === 'broadcasts' ? broadcasts : [...broadcasts, ...userNotifications]}
                        keyExtractor={(item: any, idx) => String(item.id || idx)}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#4F46E5']}
                            />
                        }
                        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }: { item: any }) => {
                            // Check if this is a broadcast
                            const isBroadcast = 'banner_style' in item || 'eyebrow' in item;

                            if (isBroadcast) {
                                const b = item as BroadcastItem;
                                return (
                                    <View style={s.broadcastCard}>
                                        <View style={s.broadcastHeader}>
                                            <View style={s.broadcastBadge}>
                                                <Megaphone size={12} color="#FFFFFF" />
                                                <Text style={s.broadcastBadgeText}>
                                                    {(b.eyebrow || 'OFFICIAL ANNOUNCEMENT').toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={s.activeDot} />
                                        </View>

                                        <Text style={s.broadcastTitle}>{b.title || b.name}</Text>

                                        {b.subtitle ? (
                                            <Text style={s.broadcastSubtitle}>{b.subtitle}</Text>
                                        ) : null}

                                        {b.image_url ? (
                                            <Image
                                                source={{ uri: b.image_url }}
                                                style={s.flyerThumb}
                                                resizeMode="cover"
                                            />
                                        ) : null}

                                        {b.cta_text ? (
                                            <TouchableOpacity
                                                style={s.broadcastCtaBtn}
                                                activeOpacity={0.85}
                                                onPress={() => handlePressLink(b.cta_link)}
                                            >
                                                <Text style={s.broadcastCtaText}>{b.cta_text}</Text>
                                                <ArrowRight size={14} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                );
                            }

                            // Otherwise, normal user notification
                            const notif = item as UserNotification;
                            return (
                                <TouchableOpacity
                                    style={s.notifCard}
                                    activeOpacity={0.8}
                                    onPress={() => handlePressLink(notif.href)}
                                >
                                    <View style={s.notifIconWrap}>
                                        <Bell size={18} color="#4F46E5" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.notifTitle}>{notif.title}</Text>
                                        {notif.subtitle ? (
                                            <Text style={s.notifSubtitle}>{notif.subtitle}</Text>
                                        ) : null}
                                        <Text style={s.notifTime}>
                                            {notif.timestamp ? new Date(notif.timestamp).toLocaleDateString() : 'Recent'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={s.emptyState}>
                                <Text style={s.emptyIcon}>🔔</Text>
                                <Text style={s.emptyTitle}>You're all caught up!</Text>
                                <Text style={s.emptySub}>
                                    No new notifications or site broadcasts right now. Check back soon for exciting promotions and updates.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tabItem: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
    },
    tabItemActive: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#4F46E5',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#4F46E5',
        fontWeight: '800',
    },
    centerLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    broadcastCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#4F46E5',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
        gap: 10,
    },
    broadcastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    broadcastBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#4F46E5',
        paddingHorizontal: 8,
        paddingVertical: 3.5,
        borderRadius: 6,
    },
    broadcastBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    broadcastTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 22,
    },
    broadcastSubtitle: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 19,
    },
    flyerThumb: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    broadcastCtaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#4F46E5',
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 4,
    },
    broadcastCtaText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    notifIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    notifSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    notifTime: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 10,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 6,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    emptySub: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
});
