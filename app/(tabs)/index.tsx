/**
 * Rytok Mobile - Home Screen
 * Mirrors the web HomeClient.jsx layout exactly:
 *   Header (avatar / greeting / location / bell)
 *   Search bar
 *   Promo banner carousel (3 gradient slides + dots)
 *   Hot-deals strip
 *   Categories 4-column grid
 *   Trending horizontal scroll
 *   "Recommended" + "Recently Added" 2-column grids
 */

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
    Bell,
    Search,
    ChevronRight,
    Flame,
    MapPin,
    ShoppingBag,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../../constants/api';
import TopAlertBar, { BroadcastItem } from '../../components/broadcasts/TopAlertBar';
import FlyerModal from '../../components/broadcasts/FlyerModal';
import PopupModal from '../../components/broadcasts/PopupModal';

const { width: SCREEN_W } = Dimensions.get('window');

/* Design tokens - light theme matching web mobile */
const C = {
    bg:            '#f8f9fa',
    surface:       '#ffffff',
    surface2:      '#f1f3f5',
    border:        '#e9ecef',
    textPrimary:   '#1a1a2e',
    textSecondary: '#6c757d',
    textMuted:     '#9ca3af',
    primary:       '#6366F1',
    primarySubtle: 'rgba(99,102,241,0.08)',
    primaryLight:  '#eef2ff',
    red:           '#ef4444',
    purple:        '#7c3aed',
};

/* Promo banner slides - mirrors web BANNERS array */
const PROMO_SLIDES = [
    {
        id: 1,
        gradient: ['#667eea', '#764ba2'] as [string, string],
        tag:      '🔥 HOT DEAL',
        title:    'Find Great\nDeals Near You',
        sub:      'Thousands of listings updated daily',
        cta:      'List Now →',
        route:    '/listings/create',
    },
    {
        id: 2,
        gradient: ['#f093fb', '#f5576c'] as [string, string],
        tag:      '⚡ FEATURED',
        title:    'Sell Anything\nIn 60 Seconds',
        sub:      'List for free — no hidden fees',
        cta:      'Sell Now →',
        route:    '/sell',
    },
    {
        id: 3,
        gradient: ['#4facfe', '#00f2fe'] as [string, string],
        tag:      '🏆 TOP PICKS',
        title:    'Trusted Sellers\nNear You',
        sub:      'Verified buyers & sellers in your area',
        cta:      'Browse →',
        route:    '/listings',
    },
];

/* Category metadata */
const SLUG_META: Record<string, { label: string; emoji: string }> = {
    'electronics':         { label: 'Electronics',   emoji: '📱' },
    'mobile-phones':       { label: 'Mobile Phones', emoji: '📱' },
    'home-garden':         { label: 'Home & Garden',  emoji: '🏠' },
    'fashion':             { label: 'Fashion',        emoji: '👗' },
    'vehicles':            { label: 'Vehicles',       emoji: '🚗' },
    'property':            { label: 'Properties',     emoji: '🏢' },
    'real-estate':         { label: 'Properties',     emoji: '🏢' },
    'sports-outdoors':     { label: 'Sports',         emoji: '⚽' },
    'sports-hobbies':      { label: 'Sports',         emoji: '⚽' },
    'jobs':                { label: 'Jobs',            emoji: '💼' },
    'kids-baby':           { label: 'Kids & Baby',    emoji: '🧸' },
    'pets-care':           { label: 'Pets',            emoji: '🐾' },
    'pets':                { label: 'Pets',            emoji: '🐾' },
    'health-beauty':       { label: 'Health & Beauty', emoji: '💄' },
    'food-beverages':      { label: 'Food',            emoji: '🍔' },
    'books-music':         { label: 'Books',           emoji: '📚' },
    'community-events':    { label: 'Events',          emoji: '🎉' },
    'business-industrial': { label: 'Business',        emoji: '🏭' },
    'services':            { label: 'Services',        emoji: '🔧' },
    'other':               { label: 'Other',           emoji: '📦' },
};

const CAT_BG = [
    '#e8f4fd','#fef9ec','#fdf2f8','#f0fdf4',
    '#eff6ff','#fff7ed','#f5f3ff','#fdf4ff',
    '#ecfdf5','#faf5ff','#fef2f2','#f0f9ff',
];

function formatPrice(price: any): string {
    if (!price) return 'Free';
    const n = Number(price);
    if (isNaN(n)) return 'Free';
    return `GHS ${n.toLocaleString()}`;
}

/* Helper to parse gradient colors from CSS or fallback */
function parseGradientColors(css?: string | null, fallback: [string, string] = ['#0055e5', '#3385FF']): [string, string, ...string[]] {
    if (!css) return fallback;
    const matches = css.match(/#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)/g);
    if (matches && matches.length >= 2) {
        return matches as [string, string, ...string[]];
    }
    if (matches && matches.length === 1) {
        return [matches[0], matches[0]];
    }
    return fallback;
}

/* Helper to navigate from banner click */
function handleBannerNavigation(link?: string | null) {
    if (!link) return;
    try {
        let path = link;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            try {
                const u = new URL(path);
                path = u.pathname + u.search;
            } catch {}
        }
        path = path.replace(/^\/(?:gh|ng|ae)\//, '/');

        const listingMatch = path.match(/\/listings\/([a-zA-Z0-9_-]+)/);
        if (listingMatch) {
            router.push(`/listings/${listingMatch[1]}` as any);
            return;
        }
        if (path.includes('/listings/create') || path.includes('/sell')) {
            router.push('/sell' as any);
            return;
        }
        if (path.includes('/deals')) {
            router.push('/deals' as any);
            return;
        }
        if (path.includes('/categories')) {
            router.push('/categories' as any);
            return;
        }
        if (path.startsWith('/')) {
            router.push(path as any);
            return;
        }
        // External link
        import('expo-web-browser').then(WebBrowser => {
            WebBrowser.openBrowserAsync(link);
        });
    } catch {
        router.push('/sell' as any);
    }
}

/* Promo Banner Carousel — dynamically renders backend banners */
function PromoBannerCarousel({ banner }: { banner?: any }) {
    const [active, setActive] = useState(0);
    const tx = useRef(new Animated.Value(0)).current;
    const timer = useRef<any>(null);

    // Prepare slides from backend banner data or fallback
    const slides = React.useMemo(() => {
        if (!banner) return PROMO_SLIDES;

        if (banner.banner_style === 'carousel' && Array.isArray(banner.slides) && banner.slides.length > 0) {
            return banner.slides.map((s: any, idx: number) => ({
                id: s.id || idx,
                isBackend: true,
                imageUrl: s.image_url,
                backgroundType: s.background_type,
                gradient: parseGradientColors(s.background_color, PROMO_SLIDES[idx % PROMO_SLIDES.length].gradient),
                tag: s.eyebrow || '',
                title: s.title || '',
                sub: s.subtitle || '',
                cta: s.cta_text || (s.cta_enabled !== false ? 'Learn More →' : ''),
                link: s.image_link || s.cta_link || '/sell',
                ctaEnabled: s.cta_enabled !== false,
            }));
        }

        // Single hero banner from backend
        return [{
            id: banner.id || 'hero',
            isBackend: true,
            imageUrl: banner.image_url,
            backgroundType: banner.background_type,
            gradient: parseGradientColors(banner.background_color, ['#0055e5', '#3385FF']),
            tag: banner.eyebrow || '',
            title: banner.title || '',
            sub: banner.subtitle || '',
            cta: banner.cta_text || (banner.cta_enabled !== false && (banner.title || banner.eyebrow) ? 'List Now →' : ''),
            link: banner.image_link || banner.cta_link || '/sell',
            ctaEnabled: banner.cta_enabled !== false,
        }];
    }, [banner]);

    const numSlides = slides.length;

    const advance = useCallback((next: number) => {
        Animated.timing(tx, { toValue: -next * SCREEN_W, duration: 450, useNativeDriver: true }).start();
        setActive(next);
    }, [tx]);

    useEffect(() => {
        if (numSlides <= 1) {
            setActive(0);
            tx.setValue(0);
            return;
        }
        const intervalMs = banner?.slide_interval || 3500;
        timer.current = setInterval(() => {
            setActive(prev => {
                const next = (prev + 1) % numSlides;
                Animated.timing(tx, { toValue: -next * SCREEN_W, duration: 450, useNativeDriver: true }).start();
                return next;
            });
        }, intervalMs);
        return () => clearInterval(timer.current);
    }, [numSlides, banner?.slide_interval, tx]);

    return (
        <View style={bs.wrap}>
            <Animated.View style={[bs.track, { width: SCREEN_W * numSlides, transform: [{ translateX: tx }] }]}>
                {slides.map((slide: any) => {
                    const hasImage = slide.imageUrl && (slide.backgroundType === 'image' || !slide.title);
                    const hasText = Boolean(slide.title || slide.tag || slide.sub);

                    return (
                        <TouchableOpacity
                            key={slide.id}
                            style={bs.slide}
                            activeOpacity={0.9}
                            onPress={() => handleBannerNavigation(slide.link)}
                        >
                            {hasImage ? (
                                <View style={StyleSheet.absoluteFill}>
                                    <Image
                                        source={{ uri: slide.imageUrl }}
                                        style={bs.imageBanner}
                                        resizeMode="cover"
                                    />
                                    {hasText && (
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)']}
                                            style={bs.imageScrim}
                                        />
                                    )}
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={slide.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                >
                                    <View style={bs.circle1} />
                                    <View style={bs.circle2} />
                                </LinearGradient>
                            )}

                            {hasText && (
                                <View style={bs.content}>
                                    {Boolean(slide.tag) && <Text style={bs.tag}>{slide.tag}</Text>}
                                    {Boolean(slide.title) && <Text style={bs.title}>{slide.title}</Text>}
                                    {Boolean(slide.sub) && <Text style={bs.sub}>{slide.sub}</Text>}
                                    {slide.ctaEnabled && Boolean(slide.cta) && (
                                        <View style={bs.cta}>
                                            <Text style={bs.ctaText}>{slide.cta}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>
            {numSlides > 1 && (
                <View style={bs.dots}>
                    {slides.map((_: any, i: number) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => { clearInterval(timer.current); advance(i); }}
                            style={[bs.dot, i === active && bs.dotActive]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const bs = StyleSheet.create({
    wrap:        { height: 200, overflow: 'hidden', marginBottom: 16 },
    track:       { flexDirection: 'row', height: 200 },
    slide:       { width: SCREEN_W, height: 200, paddingHorizontal: 20, justifyContent: 'center', overflow: 'hidden' },
    imageBanner: { width: '100%', height: '100%' },
    imageScrim:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    circle1:     { position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)' },
    circle2:     { position: 'absolute', right: 30, top: 40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
    content:     { maxWidth: '75%', zIndex: 2 },
    tag:         { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8, overflow: 'hidden' },
    title:       { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 26, marginBottom: 6 },
    sub:         { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 12, lineHeight: 16 },
    cta:         { backgroundColor: '#fff', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 7, alignSelf: 'flex-start' },
    ctaText:     { fontSize: 12, fontWeight: '800', color: '#4c1d95' },
    dots:        { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
    dot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
    dotActive:   { width: 18, borderRadius: 3, backgroundColor: '#fff' },
});

/* Hot Deals Strip */
function HotDealsBanner({ count }: { count: number }) {
    return (
        <TouchableOpacity style={hd.wrap} onPress={() => router.push('/deals' as any)} activeOpacity={0.88}>
            <LinearGradient colors={['#ff4500', '#ff6b35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={hd.inner}>
                <View style={hd.orb1} />
                <View style={hd.orb2} />
                <View style={hd.left}>
                    <View style={hd.iconCircle}>
                        <Flame size={22} color="#fff" />
                    </View>
                    <View>
                        <Text style={hd.title}>Hot Deals & Discounts</Text>
                        <Text style={hd.sub}>{count > 0 ? `${count} deals live — up to 70% off` : 'Exclusive discounts, limited time only'}</Text>
                    </View>
                </View>
                <View style={hd.cta}>
                    <Text style={hd.ctaText}>Shop Now</Text>
                    <ChevronRight size={12} color="#fff" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const hd = StyleSheet.create({
    wrap:       { marginHorizontal: 12, marginBottom: 20, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#ff4500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    inner:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, overflow: 'hidden' },
    orb1:       { position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
    orb2:       { position: 'absolute', right: 40, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
    left:       { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    title:      { fontSize: 13, fontWeight: '800', color: '#fff' },
    sub:        { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
    cta:        { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 5 },
    ctaText:    { fontSize: 11, fontWeight: '700', color: '#fff' },
});

/* Category Grid */
interface Category { slug: string; name: string; icon?: string; image_url?: string | null; }

function CategoryGrid({ cats }: { cats: Category[] }) {
    const display = cats.slice(0, 12).map((c, i) => ({
        slug:  c.slug,
        label: SLUG_META[c.slug]?.label ?? c.name,
        emoji: c.icon || SLUG_META[c.slug]?.emoji || '📦',
        img:   c.image_url || null,
        bg:    CAT_BG[i % CAT_BG.length],
    }));
    return (
        <View style={cg.grid}>
            {display.map(cat => (
                <TouchableOpacity key={cat.slug} style={cg.cell} onPress={() => router.push(`/category/${cat.slug}` as any)} activeOpacity={0.7}>
                    <View style={[cg.iconWrap, { backgroundColor: cat.bg }]}>
                        {cat.img
                            ? <Image source={{ uri: cat.img }} style={cg.iconImg} resizeMode="contain" />
                            : <Text style={cg.emoji}>{cat.emoji}</Text>}
                    </View>
                    <Text style={cg.label} numberOfLines={2}>{cat.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const cg = StyleSheet.create({
    grid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 8 },
    cell:    { width: '25%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
    iconWrap: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    iconImg: { width: '80%', height: '80%' },
    emoji:   { fontSize: 28 },
    label:   { fontSize: 11, fontWeight: '600', color: C.textPrimary, textAlign: 'center', lineHeight: 15 },
});

/* Listing Card */
interface Listing { id: string; title: string; price?: any; images?: string[]; location?: string; condition?: string; is_boosted?: boolean; is_featured?: boolean; boost_type?: string; }

const CARD_W = (SCREEN_W - 24 - 10) / 2;

function ListingCard({ item, onPress }: { item: Listing; onPress: () => void }) {
    const img  = item.images?.[0];
    const price = formatPrice(item.price);
    const boost = (() => {
        if (!item.is_boosted && !item.is_featured) return null;
        const bt = (item.boost_type || '').toLowerCase();
        if (bt.includes('urgent'))    return '🔥 Urgent';
        if (bt.includes('spotlight')) return '✨ Spotlight';
        return '⚡ Featured';
    })();
    const loc = (() => {
        const parts = (item.location || '').split('›').map((p: string) => p.trim()).filter(Boolean);
        return parts.length >= 3 ? `${parts[0]} › ${parts[parts.length - 1]}` : (item.location || '');
    })();
    return (
        <TouchableOpacity style={lc.card} onPress={onPress} activeOpacity={0.85}>
            <View style={lc.imgWrap}>
                {img ? <Image source={{ uri: img }} style={lc.img} resizeMode="cover" />
                     : <View style={[lc.img, lc.imgPh]}><ShoppingBag size={28} color={C.textMuted} /></View>}
                {boost && <View style={lc.boostBadge}><Text style={lc.boostTxt}>{boost}</Text></View>}
            </View>
            <View style={lc.body}>
                <Text style={lc.price}>{price}</Text>
                <Text style={lc.title} numberOfLines={2}>{item.title}</Text>
                <View style={lc.meta}>
                    {loc ? <View style={lc.locRow}><MapPin size={10} color={C.textMuted} /><Text style={lc.locTxt} numberOfLines={1}>{loc}</Text></View> : null}
                    {item.condition && (
                        <View style={lc.cond}>
                            <Text style={lc.condTxt}>{item.condition === 'new' ? 'New' : item.condition === 'like_new' ? 'Like New' : item.condition}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const lc = StyleSheet.create({
    card:      { width: CARD_W, backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    imgWrap:   { position: 'relative', aspectRatio: 1, backgroundColor: '#f5f6fa' },
    img:       { width: '100%', height: '100%' },
    imgPh:     { alignItems: 'center', justifyContent: 'center' },
    boostBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    boostTxt:  { fontSize: 9, fontWeight: '700', color: '#fff' },
    body:      { padding: 9 },
    price:     { fontSize: 14, fontWeight: '800', color: C.primary, marginBottom: 3 },
    title:     { fontSize: 12, fontWeight: '600', color: C.textPrimary, lineHeight: 16, marginBottom: 6 },
    meta:      { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    locRow:    { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
    locTxt:    { fontSize: 10, color: C.textMuted, flex: 1 },
    cond:      { backgroundColor: C.primaryLight, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
    condTxt:   { fontSize: 9, fontWeight: '700', color: C.primary, textTransform: 'uppercase' },
});

/* Trending Card */
function TrendingCard({ item, onPress }: { item: Listing; onPress: () => void }) {
    const img = item.images?.[0];
    return (
        <TouchableOpacity style={tc.card} onPress={onPress} activeOpacity={0.85}>
            <View style={tc.imgWrap}>
                {img ? <Image source={{ uri: img }} style={tc.img} resizeMode="cover" />
                     : <View style={[tc.img, tc.imgPh]}><ShoppingBag size={22} color={C.textMuted} /></View>}
            </View>
            <View style={tc.body}>
                <Text style={tc.price}>{formatPrice(item.price)}</Text>
                <Text style={tc.title} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const tc = StyleSheet.create({
    card:   { width: 160, backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    imgWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f5f6fa' },
    img:    { width: '100%', height: '100%' },
    imgPh:  { alignItems: 'center', justifyContent: 'center' },
    body:   { padding: 9 },
    price:  { fontSize: 14, fontWeight: '800', color: C.red, marginBottom: 3 },
    title:  { fontSize: 12, fontWeight: '700', color: C.textPrimary, lineHeight: 16 },
});

/* Section Header */
function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
    return (
        <View style={sh.row}>
            <Text style={sh.title}>{title}</Text>
            {onPress && (
                <TouchableOpacity style={sh.pill} onPress={onPress} activeOpacity={0.7}>
                    <Text style={sh.pillTxt}>View All</Text>
                    <ChevronRight size={12} color={C.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const sh = StyleSheet.create({
    row:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 20, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.border },
    title:   { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.2 },
    pill:    { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: C.primarySubtle, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
    pillTxt: { fontSize: 12, fontWeight: '700', color: C.primary },
});

/* Skeleton */
function Skel({ w, h, style }: { w: number | string; h: number; style?: any }) {
    return <View style={[{ width: w, height: h, borderRadius: 12, backgroundColor: '#e9ecef' }, style]} />;
}

/* ── Main Screen ─────────────────────────────────────────────────── */
export default function HomeScreen() {
    const [cats,      setCats]      = useState<Category[]>([]);
    const [popular,   setPopular]   = useState<Listing[]>([]);
    const [recent,    setRecent]    = useState<Listing[]>([]);
    const [trending,  setTrending]  = useState<Listing[]>([]);
    const [dealCount, setDealCount] = useState(0);
    const [heroBanner, setHeroBanner] = useState<any>(null);
    const [alertBanner, setAlertBanner] = useState<BroadcastItem | null>(null);
    const [flyerBanner, setFlyerBanner] = useState<BroadcastItem | null>(null);
    const [popupBanner, setPopupBanner] = useState<BroadcastItem | null>(null);
    const [loadCats,  setLoadCats]  = useState(true);
    const [loadList,  setLoadList]  = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [r1, r2, r3, r4, r5, r6] = await Promise.allSettled([
                apiFetch('/api/categories'),
                apiFetch('/api/listings?sort=popular&limit=8'),
                apiFetch('/api/listings?sort=newest&limit=8'),
                apiFetch('/api/listings/trending?limit=8'),
                apiFetch('/api/deals?limit=1'),
                apiFetch('/api/banner'),
            ]);
            if (r1.status === 'fulfilled' && r1.value.ok) { const d = await r1.value.json(); setCats(d?.categories || []); }
            setLoadCats(false);
            if (r2.status === 'fulfilled' && r2.value.ok) { const d = await r2.value.json(); setPopular(d?.listings || []); }
            if (r3.status === 'fulfilled' && r3.value.ok) { const d = await r3.value.json(); setRecent(d?.listings || []); }
            if (r4.status === 'fulfilled' && r4.value.ok) { const d = await r4.value.json(); setTrending(d?.listings || []); }
            if (r5.status === 'fulfilled' && r5.value.ok) { const d = await r5.value.json(); if (d?.total) setDealCount(d.total); }
            if (r6.status === 'fulfilled' && r6.value.ok) {
                const d = await r6.value.json();
                if (d?.heroBanner || d?.banner) setHeroBanner(d.heroBanner || d.banner);
                if (d?.alertBanner) setAlertBanner(d.alertBanner);
                if (d?.flyerBanner) setFlyerBanner(d.flyerBanner);
                if (d?.popupBanner) setPopupBanner(d.popupBanner);
            }

            // Also check /api/broadcasts directly for any instant admin broadcasts
            try {
                const bRes = await apiFetch('/api/broadcasts');
                if (bRes.ok) {
                    const bData = await bRes.json();
                    if (bData?.alert) setAlertBanner(bData.alert);
                    if (bData?.flyer) setFlyerBanner(bData.flyer);
                    if (bData?.popup) setPopupBanner(bData.popup);
                }
            } catch {}
        } catch {}
        finally { setLoadList(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const go = (id: string) => router.push(`/listings/${id}` as any);

    return (
        <SafeAreaView style={pg.page} edges={['top']}>

            {/* Header */}
            <View style={pg.header}>
                <View style={pg.headerLeft}>
                    <TouchableOpacity style={pg.avatarBtn} onPress={() => router.push('/profile' as any)} activeOpacity={0.8}>
                        <LinearGradient colors={[C.primary, C.purple]} style={pg.avatarGrad}>
                            <ShoppingBag size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <View>
                        <Text style={pg.brand}>rytok</Text>
                        <View style={pg.locRow}>
                            <MapPin size={11} color={C.textSecondary} />
                            <Text style={pg.locTxt}>Ghana</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={pg.bell}
                    activeOpacity={0.7}
                    onPress={() => router.push('/notifications' as any)}
                >
                    <Bell size={20} color={C.textPrimary} />
                    {(alertBanner || flyerBanner || popupBanner) && <View style={pg.bellDot} />}
                </TouchableOpacity>
            </View>

            {/* Live Broadcast / Announcement Bar from /admin/communication/broadcasts */}
            <TopAlertBar alert={alertBanner} />

            <ScrollView style={pg.scroll} showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={C.primary} colors={[C.primary]} />}
            >
                {/* Search */}
                <View style={pg.searchWrap}>
                    <TouchableOpacity style={pg.searchBar} onPress={() => router.push('/search' as any)} activeOpacity={0.85}>
                        <Search size={18} color={C.textMuted} />
                        <Text style={pg.searchPh}>Search listings, deals, shops...</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner Carousel */}
                <PromoBannerCarousel banner={heroBanner} />

                {/* Hot Deals */}
                <HotDealsBanner count={dealCount} />

                {/* Categories */}
                <View style={pg.section}>
                    <View style={[sh.row, { borderTopWidth: 0, paddingTop: 4 }]}>
                        <Text style={sh.title}>Our Categories</Text>
                        <TouchableOpacity style={sh.pill} onPress={() => router.push('/categories' as any)} activeOpacity={0.7}>
                            <Text style={sh.pillTxt}>View All</Text>
                            <ChevronRight size={12} color={C.primary} />
                        </TouchableOpacity>
                    </View>
                    {loadCats ? (
                        <View style={cg.grid}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <View key={i} style={cg.cell}>
                                    <Skel w={64} h={64} style={{ borderRadius: 16, marginBottom: 6 }} />
                                    <Skel w={48} h={10} />
                                </View>
                            ))}
                        </View>
                    ) : <CategoryGrid cats={cats} />}
                </View>

                {/* Trending */}
                {(loadList || trending.length > 0) && (
                    <View style={pg.section}>
                        <SectionHeader title="🔥 Trending" onPress={() => router.push('/listings?sort=trending' as any)} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pg.hScroll}>
                            {loadList
                                ? Array.from({ length: 4 }).map((_, i) => <Skel key={i} w={160} h={210} style={{ marginRight: 12, borderRadius: 16 }} />)
                                : trending.map(item => <TrendingCard key={item.id} item={item} onPress={() => go(item.id)} />)
                            }
                        </ScrollView>
                    </View>
                )}

                {/* Recommended */}
                {popular.length > 0 && (
                    <View style={pg.section}>
                        <SectionHeader title="Recommended for You" onPress={() => router.push('/listings' as any)} />
                        <View style={pg.grid}>
                            {popular.map(item => <ListingCard key={item.id} item={item} onPress={() => go(item.id)} />)}
                        </View>
                    </View>
                )}

                {/* Recently Added */}
                {recent.length > 0 && (
                    <View style={pg.section}>
                        <SectionHeader title="Recently Added" onPress={() => router.push('/listings?sort=newest' as any)} />
                        <View style={pg.grid}>
                            {recent.map(item => <ListingCard key={item.id} item={item} onPress={() => go(item.id)} />)}
                        </View>
                    </View>
                )}

                {/* Empty state */}
                {!loadList && popular.length === 0 && recent.length === 0 && (
                    <View style={pg.emptyWrap}>
                        <Text style={pg.emptyEmoji}>🛍️</Text>
                        <Text style={pg.emptyTxt}>Be the first to list something!</Text>
                        <TouchableOpacity style={pg.emptyBtn} onPress={() => router.push('/sell' as any)}>
                            <Text style={pg.emptyBtnTxt}>Post a Free Ad</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        
            {/* Modal Broadcasts: Flyer Modal & Announcement Popup */}
            <FlyerModal flyer={flyerBanner} />
            <PopupModal popup={popupBanner} />
        </SafeAreaView>
    );
}

/* Page styles */
const pg = StyleSheet.create({
    page:       { flex: 1, backgroundColor: C.bg },
    header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, backgroundColor: C.surface },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarBtn:  { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: C.border },
    avatarGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    brand:      { fontSize: 18, fontWeight: '900', color: C.primary, letterSpacing: -0.5 },
    locRow:     { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
    locTxt:     { fontSize: 12, color: C.textSecondary },
    bell:       { width: 42, height: 42, borderRadius: 21, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
    bellDot:    { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, borderWidth: 2, borderColor: C.surface },
    scroll:     { flex: 1 },
    searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.surface },
    searchBar:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface2, borderRadius: 50, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1.5, borderColor: C.border },
    searchPh:   { fontSize: 14, color: C.textMuted, fontWeight: '500', flex: 1 },
    section:    { backgroundColor: C.surface, marginBottom: 8 },
    grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 12, paddingBottom: 16 },
    hScroll:    { paddingHorizontal: 12, paddingBottom: 8, gap: 12 },
    emptyWrap:  { alignItems: 'center', paddingVertical: 60, backgroundColor: C.surface },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTxt:   { fontSize: 15, color: C.textSecondary, marginBottom: 16 },
    emptyBtn:   { backgroundColor: C.primary, borderRadius: 50, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
