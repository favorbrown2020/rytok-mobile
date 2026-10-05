import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
} from 'react-native';
import { router } from 'expo-router';
import { X, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BroadcastItem } from './TopAlertBar';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
    flyer: BroadcastItem | null;
}

export default function FlyerModal({ flyer }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!flyer || !flyer.image_url || !flyer.id) {
            setOpen(false);
            return;
        }

        const checkDismissed = async () => {
            try {
                const val = await AsyncStorage.getItem(`rytok_flyer_${flyer.id}`);
                if (val !== '1') {
                    const timer = setTimeout(() => {
                        setOpen(true);
                    }, 700);
                    return () => clearTimeout(timer);
                }
            } catch {
                setOpen(true);
            }
        };

        checkDismissed();
    }, [flyer]);

    if (!flyer || !flyer.image_url || !open) return null;

    const handleClose = async () => {
        setOpen(false);
        if (flyer.id) {
            try {
                await AsyncStorage.setItem(`rytok_flyer_${flyer.id}`, '1');
            } catch {}
        }
    };

    const handlePress = async () => {
        await handleClose();
        const link = flyer.cta_link;
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

                <View style={s.modalCard}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={s.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.8}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* Flyer Graphic */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        style={s.imageWrap}
                    >
                        <Image
                            source={{ uri: flyer.image_url }}
                            style={s.flyerImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Optional Tap to view banner if CTA is provided */}
                    {flyer.cta_link && flyer.cta_link !== '#' && (
                        <TouchableOpacity
                            style={s.ctaStrip}
                            activeOpacity={0.85}
                            onPress={handlePress}
                        >
                            <Text style={s.ctaStripText}>{flyer.name || 'View Promotion'}</Text>
                            <ExternalLink size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    modalCard: {
        width: Math.min(SCREEN_W - 32, 380),
        maxHeight: SCREEN_H * 0.78,
        borderRadius: 20,
        backgroundColor: '#0F172A',
        overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 50,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    imageWrap: {
        width: '100%',
        height: Math.min(SCREEN_H * 0.65, 460),
        backgroundColor: '#0F172A',
    },
    flyerImage: {
        width: '100%',
        height: '100%',
    },
    ctaStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#4F46E5',
    },
    ctaStripText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
