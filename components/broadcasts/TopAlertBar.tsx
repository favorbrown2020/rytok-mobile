import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ArrowRight, Megaphone } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BroadcastItem {
    id: number | string;
    name?: string;
    eyebrow?: string | null;
    title?: string | null;
    subtitle?: string | null;
    highlight?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    image_url?: string | null;
    background_type?: string | null;
    background_color?: string | null;
    banner_style?: string;
    is_active?: boolean;
}

interface Props {
    alert: BroadcastItem | null;
    onDismiss?: () => void;
}

export default function TopAlertBar({ alert, onDismiss }: Props) {
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!alert || !alert.id) return;
        const checkDismissed = async () => {
            try {
                const val = await AsyncStorage.getItem(`rytok_alert_${alert.id}`);
                if (val === '1') {
                    setDismissed(true);
                } else {
                    setDismissed(false);
                }
            } catch {
                setDismissed(false);
            }
        };
        checkDismissed();
    }, [alert]);

    if (!alert || dismissed) return null;

    const handleDismiss = async () => {
        setDismissed(true);
        if (alert.id) {
            try {
                await AsyncStorage.setItem(`rytok_alert_${alert.id}`, '1');
            } catch {}
        }
        if (onDismiss) onDismiss();
    };

    const handlePressCTA = () => {
        const link = alert.cta_link;
        if (!link) return;

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

    return (
        <View style={s.container}>
            <LinearGradient
                colors={['#1E1B4B', '#312E81', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.gradient}
            >
                <View style={s.contentRow}>
                    <View style={s.iconWrap}>
                        <Megaphone size={16} color="#A5B4FC" />
                    </View>

                    <View style={s.textCol}>
                        <View style={s.topLine}>
                            {alert.eyebrow ? (
                                <View style={s.eyebrowBadge}>
                                    <Text style={s.eyebrowText}>{alert.eyebrow.toUpperCase()}</Text>
                                </View>
                            ) : null}
                            <Text style={s.title} numberOfLines={1}>
                                {alert.title || alert.name}
                            </Text>
                        </View>

                        {alert.subtitle ? (
                            <Text style={s.subtitle} numberOfLines={1}>
                                {alert.subtitle}
                            </Text>
                        ) : null}
                    </View>

                    {alert.cta_text ? (
                        <TouchableOpacity
                            style={s.ctaBtn}
                            onPress={handlePressCTA}
                            activeOpacity={0.8}
                        >
                            <Text style={s.ctaText}>{alert.cta_text}</Text>
                            <ArrowRight size={12} color="#4F46E5" />
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                        style={s.closeBtn}
                        onPress={handleDismiss}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <X size={16} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 50,
    },
    gradient: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textCol: {
        flex: 1,
        justifyContent: 'center',
    },
    topLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eyebrowBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 4,
    },
    eyebrowText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        flexShrink: 1,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    ctaText: {
        color: '#4F46E5',
        fontSize: 11,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
        marginLeft: 2,
    },
});
