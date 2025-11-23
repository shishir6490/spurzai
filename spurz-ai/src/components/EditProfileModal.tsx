import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import { Card3D } from './Card3D';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => Promise<void>;
  initialData: ProfileData;
}

export interface ProfileData {
  fullName?: string;
  dateOfBirth?: Date;
  occupation?: string;
  city?: string;
  phoneNumber?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );
  const [occupation, setOccupation] = useState(initialData.occupation || '');
  const [city, setCity] = useState(initialData.city || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFullName(initialData.fullName || '');
      setDateOfBirth(initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined);
      setOccupation(initialData.occupation || '');
      setCity(initialData.city || '');
    }
  }, [visible, initialData]);

  const formatDate = (date?: Date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    setIsSaving(true);
    hapticFeedback.light();

    try {
      await onSave({
        fullName: fullName.trim(),
        dateOfBirth,
        occupation: occupation.trim() || undefined,
        city: city.trim() || undefined,
      });
      hapticFeedback.success();
      onClose();
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <Card3D
                  colors={['rgba(30,30,30,0.95)', 'rgba(20,20,20,0.95)']}
                  borderRadius={24}
                  style={styles.content}
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <View style={styles.headerLeft}>
                      <View style={styles.iconBg}>
                        <Ionicons name="person" size={24} color={COLORS.primaryGold} />
                      </View>
                      <Text style={styles.title}>Edit Profile</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.scrollView}
                  >
                    {/* Phone Number (Read Only) */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Contact Information</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputHeader}>
                          <Ionicons name="call" size={18} color={COLORS.primaryGold} />
                          <Text style={styles.inputLabel}>Phone Number</Text>
                        </View>
                        <View style={[styles.input, styles.disabledInput]}>
                          <Text style={styles.disabledText}>
                            {initialData.phoneNumber || 'Not Available'}
                          </Text>
                        </View>
                        <Text style={styles.helperText}>
                          Your phone number cannot be changed
                        </Text>
                      </View>
                    </View>

                    {/* Personal Information */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Personal Information</Text>

                      {/* Full Name */}
                      <View style={styles.inputContainer}>
                        <View style={styles.inputHeader}>
                          <Ionicons name="person-outline" size={18} color={COLORS.primaryGold} />
                          <Text style={styles.inputLabel}>Full Name *</Text>
                        </View>
                        <TextInput
                          style={styles.input}
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder="Enter your full name"
                          placeholderTextColor={COLORS.textSecondary}
                          autoCapitalize="words"
                        />
                      </View>

                      {/* Date of Birth */}
                      <View style={styles.inputContainer}>
                        <View style={styles.inputHeader}>
                          <Ionicons name="calendar-outline" size={18} color={COLORS.primaryGold} />
                          <Text style={styles.inputLabel}>Date of Birth</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.input}
                          onPress={() => {
                            setShowDatePicker(true);
                            hapticFeedback.light();
                          }}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              !dateOfBirth && styles.placeholderText,
                            ]}
                          >
                            {formatDate(dateOfBirth)}
                          </Text>
                          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      {/* Occupation */}
                      <View style={styles.inputContainer}>
                        <View style={styles.inputHeader}>
                          <Ionicons name="briefcase-outline" size={18} color={COLORS.primaryGold} />
                          <Text style={styles.inputLabel}>Occupation</Text>
                        </View>
                        <TextInput
                          style={styles.input}
                          value={occupation}
                          onChangeText={setOccupation}
                          placeholder="e.g., Software Engineer, Teacher"
                          placeholderTextColor={COLORS.textSecondary}
                          autoCapitalize="words"
                        />
                      </View>

                      {/* City */}
                      <View style={styles.inputContainer}>
                        <View style={styles.inputHeader}>
                          <Ionicons name="location-outline" size={18} color={COLORS.primaryGold} />
                          <Text style={styles.inputLabel}>City</Text>
                        </View>
                        <TextInput
                          style={styles.input}
                          value={city}
                          onChangeText={setCity}
                          placeholder="e.g., Mumbai, Delhi"
                          placeholderTextColor={COLORS.textSecondary}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSave}
                      disabled={isSaving}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[COLORS.primaryGold, '#C9A962']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.saveGradient}
                      >
                        {isSaving ? (
                          <Text style={styles.saveText}>Saving...</Text>
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={20} color="#000" />
                            <Text style={styles.saveText}>Save Changes</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScrollView>
                </Card3D>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

          {/* Date Picker */}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.datePickerContainer}>
              <Card3D
                colors={['rgba(30,30,30,0.98)', 'rgba(20,20,20,0.98)']}
                borderRadius={20}
                style={styles.datePickerCard}
              >
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerDone}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                      hapticFeedback.light();
                    }
                  }}
                  maximumDate={new Date()}
                  textColor={COLORS.textPrimary}
                  style={styles.datePicker}
                />
              </Card3D>
            </View>
          )}

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setDateOfBirth(selectedDate);
                  hapticFeedback.light();
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
  },
  content: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    paddingHorizontal: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.semibold,
  },
  input: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.regular,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disabledText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: FONTS.sans.regular,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.regular,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  saveButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  saveGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    fontFamily: FONTS.sans.bold,
  },
  datePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  datePickerCard: {
    padding: SPACING.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.semibold,
  },
  datePickerDone: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
  },
  datePicker: {
    height: 200,
  },
});
