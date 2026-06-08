import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Minus, Scale, Ruler, Check } from 'lucide-react-native';

interface IMCCalculatorProps {
  onSave: (weight: number, height: number, bmi: number, category: string) => void;
  theme: 'light' | 'dark';
}

export default function IMCCalculator({ onSave, theme }: IMCCalculatorProps) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);

  // Animation values
  const resultScale = useRef(new Animated.Value(0.9)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';

  const calculateIMC = () => {
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      setBmi(calculatedBmi);
      
      let cat = '';
      if (calculatedBmi < 18.5) {
        cat = 'Abaixo do peso';
      } else if (calculatedBmi >= 18.5 && calculatedBmi < 24.9) {
        cat = 'Peso normal';
      } else if (calculatedBmi >= 24.9 && calculatedBmi < 29.9) {
        cat = 'Sobrepeso';
      } else if (calculatedBmi >= 29.9 && calculatedBmi < 34.9) {
        cat = 'Obesidade Grau I';
      } else if (calculatedBmi >= 34.9 && calculatedBmi < 39.9) {
        cat = 'Obesidade Grau II';
      } else {
        cat = 'Obesidade Grau III';
      }
      setCategory(cat);
      setShowResult(true);

      // Trigger animations
      resultScale.setValue(0.9);
      resultOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(resultScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    // Automatically recalculate if weight or height changes while results are visible
    if (showResult) {
      calculateIMC();
    }
  }, [weight, height]);

  const handleSave = () => {
    if (bmi !== null && category) {
      onSave(weight, height, bmi, category);
    }
  };

  // Helper for BMI category styles
  const getCategoryTheme = (bmiValue: number) => {
    if (bmiValue < 18.5) {
      return {
        colors: ['#4facfe', '#00f2fe'] as [string, string],
        text: '#00f2fe',
        bg: isDark ? 'rgba(79, 172, 254, 0.15)' : 'rgba(79, 172, 254, 0.1)',
        desc: 'Você está abaixo do peso ideal. É importante manter uma alimentação equilibrada e consultar um profissional de saúde.',
      };
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      return {
        colors: ['#43e97b', '#38f9d7'] as [string, string],
        text: '#43e97b',
        bg: isDark ? 'rgba(67, 233, 123, 0.15)' : 'rgba(67, 233, 123, 0.1)',
        desc: 'Parabéns! Você está no peso ideal. Continue mantendo hábitos de vida saudáveis com exercícios e alimentação balanceada.',
      };
    } else if (bmiValue >= 24.9 && bmiValue < 29.9) {
      return {
        colors: ['#f9d423', '#ff4e50'] as [string, string],
        text: '#ffbe1a',
        bg: isDark ? 'rgba(249, 212, 35, 0.15)' : 'rgba(249, 212, 35, 0.1)',
        desc: 'Você está classificado como sobrepeso. Pequenas mudanças nos hábitos diários e alimentação podem ajudar a retornar à faixa normal.',
      };
    } else if (bmiValue >= 29.9 && bmiValue < 34.9) {
      return {
        colors: ['#ff8c00', '#e52d27'] as [string, string],
        text: '#ff8c00',
        bg: isDark ? 'rgba(255, 140, 0, 0.15)' : 'rgba(255, 140, 0, 0.1)',
        desc: 'Você está na faixa de Obesidade Grau I. Recomenda-se orientação de nutricionista e prática moderada de atividades físicas.',
      };
    } else if (bmiValue >= 34.9 && bmiValue < 39.9) {
      return {
        colors: ['#f857a6', '#ff5858'] as [string, string],
        text: '#f857a6',
        bg: isDark ? 'rgba(248, 87, 166, 0.15)' : 'rgba(248, 87, 166, 0.1)',
        desc: 'Obesidade Grau II detectada. O acompanhamento médico é muito importante para evitar complicações associadas ao peso.',
      };
    } else {
      return {
        colors: ['#ff0844', '#ffb199'] as [string, string],
        text: '#ff0844',
        bg: isDark ? 'rgba(255, 8, 68, 0.15)' : 'rgba(255, 8, 68, 0.1)',
        desc: 'Obesidade Grau III (mórbida). Procure apoio médico e nutricional especializado o quanto antes para planejar um tratamento adequado.',
      };
    }
  };

  const currentTheme = bmi !== null ? getCategoryTheme(bmi) : {
    colors: ['#667eea', '#764ba2'] as [string, string],
    text: '#667eea',
    bg: 'rgba(102, 126, 234, 0.1)',
    desc: '',
  };

  // Safe limits
  const adjustHeight = (val: number) => {
    setHeight(Math.max(100, Math.min(220, val)));
  };

  const adjustWeight = (val: number) => {
    setWeight(Math.max(20, Math.min(200, val)));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.row}>
        {/* Gender Selection */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setGender('male')}
          style={[
            styles.genderCard,
            gender === 'male' && styles.activeCardMale,
            isDark ? styles.cardDark : styles.cardLight,
          ]}
        >
          <Text style={[styles.genderText, gender === 'male' && styles.activeText, isDark ? styles.textDark : styles.textLight]}>
            Masculino
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setGender('female')}
          style={[
            styles.genderCard,
            gender === 'female' && styles.activeCardFemale,
            isDark ? styles.cardDark : styles.cardLight,
          ]}
        >
          <Text style={[styles.genderText, gender === 'female' && styles.activeText, isDark ? styles.textDark : styles.textLight]}>
            Feminino
          </Text>
        </TouchableOpacity>
      </View>

      {/* Height Selector Card */}
      <View style={[styles.controlCard, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeader}>
          <Ruler size={20} color={isDark ? '#a0aec0' : '#718096'} />
          <Text style={[styles.cardTitle, isDark ? styles.titleDark : styles.titleLight]}>Altura</Text>
        </View>
        <View style={styles.valueRow}>
          <TouchableOpacity
            style={[styles.roundBtn, isDark ? styles.roundBtnDark : styles.roundBtnLight]}
            onPress={() => adjustHeight(height - 1)}
          >
            <Minus size={20} color={isDark ? '#e2e8f0' : '#4a5568'} />
          </TouchableOpacity>
          <View style={styles.valueContainer}>
            <TextInput
              keyboardType="numeric"
              value={height.toString()}
              onChangeText={(text) => adjustHeight(parseInt(text) || 0)}
              style={[styles.valueInput, isDark ? styles.inputDark : styles.inputLight]}
            />
            <Text style={[styles.unitText, isDark ? styles.unitDark : styles.unitLight]}>cm</Text>
          </View>
          <TouchableOpacity
            style={[styles.roundBtn, isDark ? styles.roundBtnDark : styles.roundBtnLight]}
            onPress={() => adjustHeight(height + 1)}
          >
            <Plus size={20} color={isDark ? '#e2e8f0' : '#4a5568'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weight Selector Card */}
      <View style={[styles.controlCard, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeader}>
          <Scale size={20} color={isDark ? '#a0aec0' : '#718096'} />
          <Text style={[styles.cardTitle, isDark ? styles.titleDark : styles.titleLight]}>Peso</Text>
        </View>
        <View style={styles.valueRow}>
          <TouchableOpacity
            style={[styles.roundBtn, isDark ? styles.roundBtnDark : styles.roundBtnLight]}
            onPress={() => adjustWeight(weight - 1)}
          >
            <Minus size={20} color={isDark ? '#e2e8f0' : '#4a5568'} />
          </TouchableOpacity>
          <View style={styles.valueContainer}>
            <TextInput
              keyboardType="numeric"
              value={weight.toString()}
              onChangeText={(text) => adjustWeight(parseInt(text) || 0)}
              style={[styles.valueInput, isDark ? styles.inputDark : styles.inputLight]}
            />
            <Text style={[styles.unitText, isDark ? styles.unitDark : styles.unitLight]}>kg</Text>
          </View>
          <TouchableOpacity
            style={[styles.roundBtn, isDark ? styles.roundBtnDark : styles.roundBtnLight]}
            onPress={() => adjustWeight(weight + 1)}
          >
            <Plus size={20} color={isDark ? '#e2e8f0' : '#4a5568'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calculate Button (Only if result not yet shown) */}
      {!showResult && (
        <TouchableOpacity activeOpacity={0.9} onPress={calculateIMC} style={styles.calcButtonContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.calcButton}
          >
            <Text style={styles.calcButtonText}>Calcular IMC</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Animated Results Card */}
      {showResult && bmi !== null && (
        <Animated.View
          style={[
            styles.resultCard,
            {
              transform: [{ scale: resultScale }],
              opacity: resultOpacity,
            },
            isDark ? styles.cardDark : styles.cardLight,
          ]}
        >
          <Text style={[styles.resultHeader, isDark ? styles.titleDark : styles.titleLight]}>
            Seu Resultado
          </Text>

          <LinearGradient
            colors={currentTheme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bmiBadge}
          >
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiLabel}>IMC</Text>
          </LinearGradient>

          <Text style={[styles.categoryText, { color: currentTheme.text }]}>
            {category}
          </Text>

          <View style={[styles.descriptionContainer, { backgroundColor: currentTheme.bg }]}>
            <Text style={[styles.descriptionText, isDark ? styles.descDark : styles.descLight]}>
              {currentTheme.desc}
            </Text>
          </View>

          {/* Simple spectrum indicator */}
          <View style={styles.spectrumContainer}>
            <View style={styles.spectrumBar}>
              <LinearGradient
                colors={['#4facfe', '#43e97b', '#f9d423', '#ff8c00', '#ff0844']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.spectrumGradient}
              />
              {/* Marker representing current BMI */}
              <View
                style={[
                  styles.spectrumMarker,
                  {
                    left: `${Math.min(
                      96,
                      Math.max(
                        2,
                        ((bmi - 15) / (40 - 15)) * 100
                      )
                    )}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.spectrumLabels}>
              <Text style={styles.spectrumLabelText}>15</Text>
              <Text style={styles.spectrumLabelText}>18.5</Text>
              <Text style={styles.spectrumLabelText}>25</Text>
              <Text style={styles.spectrumLabelText}>30</Text>
              <Text style={styles.spectrumLabelText}>40</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowResult(false);
                setBmi(null);
              }}
              style={[styles.resetBtn, isDark ? styles.resetBtnDark : styles.resetBtnLight]}
            >
              <Text style={[styles.resetBtnText, isDark ? styles.textDark : styles.textLight]}>Refazer</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={handleSave} style={styles.saveBtnContainer}>
              <LinearGradient
                colors={currentTheme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Check size={18} color="#fff" style={styles.btnIcon} />
                <Text style={styles.saveBtnText}>Salvar Registro</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderCard: {
    flex: 1,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
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
  activeCardMale: {
    borderColor: '#4facfe',
    backgroundColor: 'rgba(79, 172, 254, 0.08)',
  },
  activeCardFemale: {
    borderColor: '#f857a6',
    backgroundColor: 'rgba(248, 87, 166, 0.08)',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeText: {
    fontWeight: '700',
  },
  textLight: {
    color: '#4a5568',
  },
  textDark: {
    color: '#cbd5e1',
  },
  controlCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  titleLight: {
    color: '#718096',
  },
  titleDark: {
    color: '#94a3b8',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  roundBtnLight: {
    backgroundColor: '#f7fafc',
  },
  roundBtnDark: {
    backgroundColor: '#334155',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueInput: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    width: 90,
    padding: 0,
  },
  inputLight: {
    color: '#1a202c',
  },
  inputDark: {
    color: '#f8fafc',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  unitLight: {
    color: '#718096',
  },
  unitDark: {
    color: '#94a3b8',
  },
  calcButtonContainer: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  calcButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  bmiBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bmiValue: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
  },
  bmiLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: -2,
  },
  categoryText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  descriptionContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  descLight: {
    color: '#4a5568',
  },
  descDark: {
    color: '#cbd5e1',
  },
  spectrumContainer: {
    width: '100%',
    marginBottom: 24,
  },
  spectrumBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    position: 'relative',
    marginBottom: 6,
  },
  spectrumGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  spectrumMarker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#764ba2',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  spectrumLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#a0aec0',
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
  },
  resetBtnLight: {
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  resetBtnDark: {
    borderColor: '#334155',
    backgroundColor: 'transparent',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtnContainer: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
});
