import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Trash2, Calendar, Scale, Ruler } from 'lucide-react-native';
import { BmiRecord } from '../utils/storage';

interface HistoryListProps {
  records: BmiRecord[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  theme: 'light' | 'dark';
}

export default function HistoryList({ records, onDelete, onClearAll, theme }: HistoryListProps) {
  const isDark = theme === 'dark';

  const getCategoryColor = (bmi: number) => {
    if (bmi < 18.5) return '#4facfe';
    if (bmi >= 18.5 && bmi < 24.9) return '#43e97b';
    if (bmi >= 24.9 && bmi < 29.9) return '#ffbe1a';
    if (bmi >= 29.9 && bmi < 34.9) return '#ff8c00';
    if (bmi >= 34.9 && bmi < 39.9) return '#f857a6';
    return '#ff0844';
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Excluir registro',
      'Tem certeza que deseja excluir esta medição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(id) },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Limpar histórico',
      'Tem certeza que deseja apagar todo o histórico de medições? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar Tudo', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  const renderItem = ({ item }: { item: BmiRecord }) => {
    const categoryColor = getCategoryColor(item.bmi);

    return (
      <View style={[styles.recordCard, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.bmiText, isDark ? styles.textDark : styles.textLight]}>
              {item.bmi.toFixed(1)} <Text style={styles.bmiUnit}>IMC</Text>
            </Text>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
              <Trash2 size={16} color={isDark ? '#94a3b8' : '#a0aec0'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.categoryLabel, { color: categoryColor }]}>
            {item.category}
          </Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Scale size={14} color={isDark ? '#64748b' : '#94a3b8'} style={styles.detailIcon} />
              <Text style={[styles.detailText, isDark ? styles.detailTextDark : styles.detailTextLight]}>
                {item.weight} kg
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ruler size={14} color={isDark ? '#64748b' : '#94a3b8'} style={styles.detailIcon} />
              <Text style={[styles.detailText, isDark ? styles.detailTextDark : styles.detailTextLight]}>
                {item.height} cm
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Calendar size={12} color={isDark ? '#475569' : '#cbd5e1'} style={styles.dateIcon} />
            <Text style={[styles.dateText, isDark ? styles.dateTextDark : styles.dateTextLight]}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {records.length > 0 ? (
        <>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
              Histórico ({records.length})
            </Text>
            <TouchableOpacity onPress={confirmClearAll}>
              <Text style={styles.clearAllText}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Container scroll covers everything
          />
        </>
      ) : (
        <View style={[styles.emptyCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}>
            Nenhuma medição
          </Text>
          <Text style={[styles.emptyDesc, isDark ? styles.detailTextDark : styles.detailTextLight]}>
            Faça seu primeiro cálculo para começar a registrar seu histórico de evolução.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearAllText: {
    color: '#ff0844',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordCard: {
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#edf2f7',
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  categoryIndicator: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  bmiText: {
    fontSize: 20,
    fontWeight: '800',
  },
  bmiUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a0aec0',
  },
  textLight: {
    color: '#2d3748',
  },
  textDark: {
    color: '#f8fafc',
  },
  deleteBtn: {
    padding: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailTextLight: {
    color: '#4a5568',
  },
  detailTextDark: {
    color: '#94a3b8',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateTextLight: {
    color: '#a0aec0',
  },
  dateTextDark: {
    color: '#64748b',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
});
