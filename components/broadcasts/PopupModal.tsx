import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BroadcastItem } from './TopAlertBar';

interface Props {
    popup: BroadcastItem | null;
}

export default function PopupModal({ popup }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!popup || !popup.id) {
            setOpen(false);
            return;
        }

        const checkDismissed = async () => {
            try {
                const val = await AsyncStorage.getItem(`rytok_popup_${popup.id}`);
                if (val !== '1') {
                    const timer = setTimeout(() => {
                        setOpen(true);
                    }, 800);
                    return () => clearTimeout(timer);
                }
            } catch {
                setOpen(true);
            }
        };

        checkDismissed();
    }, [popup]);

    if (!popup || !open) return null;

    const handleClose = async () => {
        setOpen(false);
        if (popup.id) {
            try {
                await AsyncStorage.setItem(`rytok_popup_${popup.id}`, '1');
            } catch {}
        }
    };

    const handlePressCTA = async () => {
        await handleClose();
        const link = popup.cta_link;
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
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={s.overlay}>
                <TouchableOpacity
                    style={s.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <View style={s.dialog}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#1E1B4B', '#312E81', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.header}
                    >
                        <View style={s.headerTop}>
                            <View style={s.eyebrowBadge}>
                                <Sparkles size={12} color="#FDE047" />
                                <Text style={s.eyebrowText}>
                                    {(popup.eyebrow || 'Announcement').toUpperCase()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={s.closeBtn}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <X size={18} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                        </View>

                        <Text style={s.title}>{popup.title || popup.name}</Text>
                    </LinearGradient>

                    {/* Body */}
                    <View style={s.body}>
                        {popup.subtitle ? (
                            <Text style={s.subtitle}>{popup.subtitle}</Text>
                        ) : null}

                        <View style={s.actions}>
                            {popup.cta_text ? (
                                <TouchableOpacity
                                    style={s.primaryBtn}
                                    activeOpacity={0.85}
                                    onPress={handlePressCTA}
                                >
                                    <Text style={s.primaryBtnText}>{popup.cta_text}</Text>
                                    <ArrowRight size={15} color="#FFFFFF" />
                                </TouchableOpacity>
                            ) : null}

                            <TouchableOpacity
                                style={s.dismissBtn}
                                activeOpacity={0.7}
                                onPress={handleClose}
                            >
                                <Text style={s.dismissBtnText}>Dismiss</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    dialog: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
    },
    header: {
        padding: 20,
        gap: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eyebrowBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    eyebrowText: {
        color: '#FDE047',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    closeBtn: {
        padding: 4,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        lineHeight: 24,
    },
    body: {
        padding: 20,
        gap: 16,
    },
    subtitle: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 22,
    },
    actions: {
        gap: 10,
        marginTop: 4,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#4F46E5',
        paddingVertical: 13,
        borderRadius: 12,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    dismissBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    dismissBtnText: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '700',
    },
});
