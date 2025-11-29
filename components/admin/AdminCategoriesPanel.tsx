import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getFirestore, setDoc, deleteDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlindTestCategories, BlindTestCategory } from '@/hooks/useBlindTestCategories';

export default function AdminCategoriesPanel() {
  const { categories, loading } = useBlindTestCategories();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    emoji: '',
    gradientStart: '#C62828',
    gradientEnd: '#E53935',
    description: '',
    order: 0,
    active: true,
  });

  const resetForm = () => {
    setFormData({
      id: '',
      label: '',
      emoji: '',
      gradientStart: '#C62828',
      gradientEnd: '#E53935',
      description: '',
      order: categories.length + 1,
      active: true,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (category: BlindTestCategory) => {
    setFormData({
      id: category.id,
      label: category.label,
      emoji: category.emoji,
      gradientStart: category.gradient[0],
      gradientEnd: category.gradient[1],
      description: category.description,
      order: category.order || 0,
      active: category.active !== false,
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.label || !formData.emoji) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (ID, Label, Emoji)');
      return;
    }

    try {
      const db = getFirestore();
      const categoryRef = doc(db, 'blindtest-categories', formData.id);

      const categoryData = {
        id: formData.id,
        label: formData.label,
        emoji: formData.emoji,
        gradient: [formData.gradientStart, formData.gradientEnd],
        description: formData.description,
        order: formData.order,
        active: formData.active,
      };

      await setDoc(categoryRef, categoryData, { merge: true });

      Alert.alert('Succès ! 🎉', `Catégorie "${formData.label}" ${editingId ? 'modifiée' : 'ajoutée'} avec succès !`);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la catégorie');
    }
  };

  const handleDelete = (categoryId: string, categoryLabel: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryLabel}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              const categoryRef = doc(db, 'blindtest-categories', categoryId);
              await deleteDoc(categoryRef);
              Alert.alert('Succès', 'Catégorie supprimée avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <MaterialCommunityIcons name="music-note" size={24} color="#FFD700" />
        <Text style={styles.headerText}>🎵 GESTION DES CATÉGORIES BLIND TEST</Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#FFD700"
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} nestedScrollEnabled>
          {/* Liste des catégories existantes */}
          <Text style={styles.sectionTitle}>Catégories existantes ({categories.length})</Text>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                  <Text style={styles.categoryId}>ID: {category.id}</Text>
                </View>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(category)}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(category.id, category.label)}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Formulaire d'ajout/modification */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              {editingId ? 'Modifier la catégorie' : 'Ajouter une nouvelle catégorie'}
            </Text>

            <Text style={styles.label}>ID (unique) *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: noel, generiques..."
              placeholderTextColor="#888"
              value={formData.id}
              onChangeText={(text) => setFormData({ ...formData, id: text.toLowerCase().replace(/\s+/g, '-') })}
              editable={!editingId}
            />

            <Text style={styles.label}>Label *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Noël, Génériques TV..."
              placeholderTextColor="#888"
              value={formData.label}
              onChangeText={(text) => setFormData({ ...formData, label: text })}
            />

            <Text style={styles.label}>Emoji *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 🎄, 📺..."
              placeholderTextColor="#888"
              value={formData.emoji}
              onChangeText={(text) => setFormData({ ...formData, emoji: text })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Chants de Noël..."
              placeholderTextColor="#888"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <Text style={styles.label}>Gradient Start</Text>
            <TextInput
              style={styles.input}
              placeholder="#C62828"
              placeholderTextColor="#888"
              value={formData.gradientStart}
              onChangeText={(text) => setFormData({ ...formData, gradientStart: text })}
            />

            <Text style={styles.label}>Gradient End</Text>
            <TextInput
              style={styles.input}
              placeholder="#E53935"
              placeholderTextColor="#888"
              value={formData.gradientEnd}
              onChangeText={(text) => setFormData({ ...formData, gradientEnd: text })}
            />

            <Text style={styles.label}>Ordre</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#888"
              value={formData.order.toString()}
              onChangeText={(text) => setFormData({ ...formData, order: parseInt(text) || 0 })}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, active: !formData.active })}
            >
              <MaterialCommunityIcons
                name={formData.active ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color="#FFD700"
              />
              <Text style={styles.checkboxLabel}>Active</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.saveButton, (!formData.id || !formData.label || !formData.emoji) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!formData.id || !formData.label || !formData.emoji}
              >
                <LinearGradient
                  colors={(!formData.id || !formData.label || !formData.emoji) ? ['#555', '#333'] : ['#00C853', '#00897B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>  {editingId ? 'Modifier' : 'Ajouter'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {isAdding && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(196, 30, 58, 0.3)',
  },
  headerText: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    maxHeight: 600,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  categoryId: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#0277BD',
  },
  deleteButton: {
    backgroundColor: '#C62828',
  },
  formContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  formActions: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

