import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BmiRecord {
  id: string;
  weight: number;
  height: number;
  bmi: number;
  category: string;
  date: string;
}

const STORAGE_KEY = '@imcmaster:records';

export const getRecords = async (): Promise<BmiRecord[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler registros', e);
    return [];
  }
};

export const saveRecord = async (
  weight: number,
  height: number,
  bmi: number,
  category: string
): Promise<BmiRecord[]> => {
  try {
    const records = await getRecords();
    const newRecord: BmiRecord = {
      id: Math.random().toString(36).substring(2, 9),
      weight,
      height,
      bmi,
      category,
      date: new Date().toISOString(),
    };
    const updatedRecords = [newRecord, ...records];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    return updatedRecords;
  } catch (e) {
    console.error('Erro ao salvar registro', e);
    return [];
  }
};

export const deleteRecord = async (id: string): Promise<BmiRecord[]> => {
  try {
    const records = await getRecords();
    const updatedRecords = records.filter((record) => record.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    return updatedRecords;
  } catch (e) {
    console.error('Erro ao excluir registro', e);
    return [];
  }
};

export const clearRecords = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Erro ao limpar registros', e);
    return false;
  }
};
