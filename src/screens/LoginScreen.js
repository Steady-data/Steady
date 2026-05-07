import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';

const VALID_USERNAME = 'Steady';
const VALID_PASSWORD = '1234';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const { t } = useTranslation();

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setError('');
      login();
    } else {
      setError(t('loginError'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.logo}>●</Text>
            <Text style={styles.title}>{t('appTitle')}</Text>
            <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('username')}
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={(v) => { setUsername(v); setError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry
                textContentType="password"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.loginButton, (!username || !password) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  logo: {
    fontSize: 40,
    color: '#000000',
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  form: {
    gap: 12,
  },
  inputWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  input: {
    height: 54,
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 17,
    color: '#000000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -4,
  },
  loginButton: {
    height: 54,
    backgroundColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#3C3C43',
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
