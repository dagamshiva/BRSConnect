import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../theme/colors';
import { assemblySegments } from '../data/assemblySegments';

interface AssemblySelectorProps {
  value: string | null;
  onSelect: (segment: string | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  mode?: 'dropdown' | 'autocomplete';
}

export const AssemblySelector = ({
  value,
  onSelect,
  placeholder = 'Select Assembly Segment',
  label,
  required = false,
  mode = 'autocomplete',
}: AssemblySelectorProps): JSX.Element => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSegments = assemblySegments.filter(segment =>
    segment.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (segment: string) => {
    onSelect(segment);
    setSearchText('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchText('');
    setShowDropdown(false);
  };

  if (mode === 'dropdown') {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <MaterialIcons
              name="place"
              size={18}
              color={colors.textSecondary}
              style={styles.selectorIcon}
            />
            <Text style={styles.selectorText}>
              {value || placeholder}
            </Text>
            <MaterialIcons
              name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {value && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <MaterialIcons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={18}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search assembly segment..."
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <ScrollView
              style={styles.dropdownList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {filteredSegments.map(segment => (
                <TouchableOpacity
                  key={segment}
                  style={[
                    styles.dropdownItem,
                    value === segment && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelect(segment)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === segment && styles.dropdownItemTextActive,
                    ]}
                  >
                    {segment}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredSegments.length === 0 && (
                <View style={styles.dropdownItem}>
                  <Text style={[styles.dropdownItemText, { color: colors.textSecondary }]}>
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // Autocomplete mode (for CreateFeedScreen style)
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.autocompleteContainer}>
        <View style={styles.autocompleteInputWrapper}>
          <MaterialIcons
            name="place"
            size={18}
            color={colors.textSecondary}
            style={styles.autocompleteIcon}
          />
          <TextInput
            style={styles.autocompleteInput}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={value || searchText}
            onChangeText={text => {
              setSearchText(text);
              setShowDropdown(text.length > 0);
              if (!text) {
                onSelect(null);
              } else {
                if (value && text !== value) {
                  onSelect(null);
                }
              }
            }}
            onFocus={() => {
              const currentText = value || searchText;
              if (currentText.length > 0 && !value) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200);
            }}
          />
          {(value || searchText.length > 0) && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButtonInline}
            >
              <MaterialIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {showDropdown && (searchText.length > 0 || !value) && (
          <View style={styles.autocompleteDropdown}>
            <ScrollView
              style={styles.autocompleteDropdownList}
              keyboardShouldPersistTaps="handled"
            >
              {filteredSegments.slice(0, 10).map(segment => (
                <TouchableOpacity
                  key={segment}
                  style={styles.autocompleteDropdownItem}
                  onPress={() => handleSelect(segment)}
                >
                  <Text style={styles.autocompleteDropdownItemText}>
                    {segment}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredSegments.length === 0 && (
                <View style={styles.autocompleteDropdownItem}>
                  <Text
                    style={[
                      styles.autocompleteDropdownItemText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  // Dropdown mode styles
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 8,
    height: 56,
    minHeight: 56,
    maxHeight: 56,
  },
  selectorIcon: {
    marginRight: 4,
  },
  selectorText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 400,
    overflow: 'hidden',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 4,
  },
  dropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.primary + '20',
  },
  dropdownItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Autocomplete mode styles
  autocompleteContainer: {
    position: 'relative',
  },
  autocompleteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  autocompleteIcon: {
    marginRight: 8,
  },
  autocompleteInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButtonInline: {
    padding: 4,
  },
  autocompleteDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  autocompleteDropdownList: {
    maxHeight: 200,
  },
  autocompleteDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  autocompleteDropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});

