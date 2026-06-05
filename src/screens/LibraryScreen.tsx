import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../config/constants';
import { usePublications, usePublicationCategories } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { useViewed } from '../contexts/ViewedContext';
import { Publication } from '../types';
import ConferenceHeader from '../components/ConferenceHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  MAGAZINE: 'newspaper',
  PRAYER: 'heart',
  KHELWA: 'leaf',
  ARTICLE: 'document-text',
  OTHER: 'folder-open',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryColor(pub: Publication): string {
  return pub.category?.color || '#6366F1';
}

function getCategoryIcon(pub: Publication): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[pub.category?.name] || 'folder-open';
}

function getViewerUrl(url: string): string | null {
  // Google Drive file links
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  // Google Docs/Sheets/Slides
  if (url.includes('docs.google.com')) {
    return url.replace(/\/edit.*$/, '/preview');
  }
  // Direct PDF links - use Google Docs Viewer
  if (url.match(/\.pdf(\?|$)/i)) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  }
  // Any other URL - try opening in webview directly
  return url;
}

export default function LibraryScreen() {
  const { lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const { data: publications, isLoading, refetch } = usePublications(categoryFilter);
  const { data: categories } = usePublicationCategories();

  const { markPublicationViewed } = useViewed();

  const openPublication = useCallback((item: Publication) => {
    markPublicationViewed(item.id);
    const embeddedUrl = getViewerUrl(item.contentUrl);
    if (embeddedUrl && Platform.OS !== 'web') {
      setViewerTitle(item.title);
      setViewerUrl(embeddedUrl);
    } else {
      Linking.openURL(item.contentUrl);
    }
  }, [markPublicationViewed]);

  const renderItem = ({ item, index }: { item: Publication; index: number }) => {
    const catColor = getCategoryColor(item);
    return (
      <TouchableOpacity
        style={[styles.gridCard, index % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }]}
        activeOpacity={0.8}
        onPress={() => openPublication(item)}
      >
        <LinearGradient
          colors={[catColor + '25', COLORS.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gridCardGradient}
        >
          {/* Icon */}
          <View style={[styles.gridCardIcon, { backgroundColor: catColor + '20' }]}>
            <Ionicons name={getCategoryIcon(item)} size={28} color={catColor} />
          </View>

          {/* Title */}
          <Text style={styles.gridCardTitle} numberOfLines={2}>{item.title}</Text>

          {/* Meta row */}
          <View style={styles.gridCardMeta}>
            <View style={[styles.gridCatPill, { backgroundColor: catColor + '15' }]}>
              <Text style={[styles.gridCatText, { color: catColor }]}>
                {lang === 'ar' ? item.category?.labelAr : item.category?.labelEn}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.gridCardFooter}>
            {item.fileSize ? (
              <Text style={styles.gridFooterText}>{formatFileSize(item.fileSize)}</Text>
            ) : null}
            {item.publishedAt && (
              <Text style={styles.gridFooterText}>
                {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            )}
          </View>

          {/* Read indicator */}
          <View style={[styles.gridReadBtn, { backgroundColor: catColor }]}>
            <Ionicons name="reader-outline" size={14} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />

      {/* Title */}
      <View style={styles.screenHeader}>
        <View style={styles.headerRow}>
          <Ionicons name="library" size={24} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{lang === 'ar' ? 'المكتبة' : 'Library'}</Text>
            <Text style={styles.headerSubtitle}>
              {publications?.length || 0} {lang === 'ar' ? 'ملف متاح' : 'publications available'}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        <TouchableOpacity
          style={[styles.categoryCard, selectedCategory === 'ALL' && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
          onPress={() => setSelectedCategory('ALL')}
          activeOpacity={0.7}
        >
          <Ionicons name="grid" size={20} color={selectedCategory === 'ALL' ? '#fff' : COLORS.primary} />
          <Text style={[styles.categoryLabel, selectedCategory === 'ALL' && { color: '#fff' }]}>
            {lang === 'ar' ? 'الكل' : 'All'}
          </Text>
        </TouchableOpacity>
        {(categories || []).map((item) => {
          const isActive = selectedCategory === item.id;
          const icon = CATEGORY_ICONS[item.name] || 'folder-open';
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryCard, isActive && { backgroundColor: item.color, borderColor: item.color }]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name={icon} size={20} color={isActive ? '#fff' : item.color} />
              <Text style={[styles.categoryLabel, isActive && { color: '#fff' }]}>
                {lang === 'ar' ? item.labelAr : item.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : !publications?.length ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="library-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No publications yet</Text>
          <Text style={styles.emptySubtitle}>New magazines, prayers & articles will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
        />
      )}

      {/* In-app Viewer Modal */}
      <Modal visible={!!viewerUrl} animationType="slide" onRequestClose={() => setViewerUrl(null)}>
        <View style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setViewerUrl(null)} style={styles.viewerCloseBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.viewerTitle} numberOfLines={1}>{viewerTitle}</Text>
            <TouchableOpacity onPress={() => { if (viewerUrl) Linking.openURL(viewerUrl); }} style={styles.viewerExternalBtn}>
              <Ionicons name="open-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {viewerUrl && (
            <WebView
              source={{ uri: viewerUrl }}
              style={styles.webview}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator color={COLORS.primary} size="large" />
                  <Text style={styles.loadingText}>Loading document...</Text>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Header
  screenHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  // Category Grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  // List
  list: { padding: 16, paddingTop: 4 },
  gridRow: { justifyContent: 'space-between' },
  // Grid Card
  gridCard: { flex: 1, marginBottom: 12, borderRadius: 16, overflow: 'hidden', maxWidth: '48.5%' },
  gridCardGradient: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, minHeight: 180, justifyContent: 'space-between' },
  gridCardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8, lineHeight: 19 },
  gridCardMeta: { flexDirection: 'row', marginBottom: 6 },
  gridCatPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  gridCatText: { fontSize: 10, fontWeight: '700' },
  gridCardFooter: { flexDirection: 'row', gap: 8 },
  gridFooterText: { fontSize: 10, color: COLORS.textMuted },
  gridReadBtn: { position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  // Empty
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  // Viewer
  viewerContainer: { flex: 1, backgroundColor: COLORS.background },
  viewerHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 30, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  viewerCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  viewerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text, marginHorizontal: 12 },
  viewerExternalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  webview: { flex: 1 },
  webviewLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textMuted, marginTop: 12, fontSize: 14 },
});
