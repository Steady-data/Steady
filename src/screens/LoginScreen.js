import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';
import { C, R, SPACING } from '../utils/theme';

const VALID_USERNAME = 'Steady';
const VALID_PASSWORD = '1234';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const { login } = useApp();
  const { t }     = useTranslation();

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setError('');
      login();
    } else {
      setError(t('loginError'));
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.inner}>

          {/* Brand */}
          <View style={s.brand}>
            <View style={s.logoMark}>
              <View style={s.logoDot} />
            </View>
            <Text style={s.title}>{t('appTitle')}</Text>
            <Text style={s.subtitle}>{t('appSubtitle')}</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder={t('username')}
              placeholderTextColor={C.text2}
              value={username}
              onChangeText={v => { setUsername(v); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              autoComplete="username"
              returnKeyType="next"
              selectionColor={C.accent}
            />
            <TextInput
              style={s.input}
              placeholder={t('password')}
              placeholderTextColor={C.text2}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              secureTextEntry
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              selectionColor={C.accent}
            />

            {!!error && <Text style={s.error}>{error}</Text>}

            <TouchableOpacity
              style={[s.btn, (!username || !password) && s.btnDim]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={s.btnText}>{t('login')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={s.footer}>
            Steady · Restaurant Intelligence
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  kav: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent:  'center',
    paddingHorizontal: SPACING.xl,
  },

  /* Brand block */
  brand: {
    alignItems:   'center',
    marginBottom: SPACING.xxl,
  },
  logoMark: {
    width:           48,
    height:          48,
    borderRadius:    R,
    backgroundColor: C.accent,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.l,
  },
  logoDot: {
    width:           16,
    height:          16,
    borderRadius:    R,
    backgroundColor: C.bg,
  },
  title: {
    fontSize:      48,
    fontWeight:    '700',
    color:         C.text,
    letterSpacing: -1.5,
    marginBottom:  SPACING.s,
  },
  subtitle: {
    fontSize:   15,
    fontWeight: '400',
    color:      C.text2,
    textAlign:  'center',
  },

  /* Form block */
  form: {
    gap: SPACING.s,
  },
  input: {
    height:          56,
    backgroundColor: C.surface,
    borderRadius:    R,
    paddingHorizontal: SPACING.m,
    fontSize:        16,
    fontWeight:      '400',
    color:           C.text,
  },
  error: {
    fontSize:  13,
    color:     C.error,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  btn: {
    height:          56,
    backgroundColor: C.accent,
    borderRadius:    R,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       SPACING.s,
  },
  btnDim: {
    opacity: 0.45,
  },
  btnText: {
    fontSize:      16,
    fontWeight:    '700',
    color:         C.bg,
    letterSpacing: 0.3,
  },

  /* Footer */
  footer: {
    position:  'absolute',
    bottom:    SPACING.l,
    alignSelf: 'center',
    fontSize:  12,
    color:     C.surface2,
    fontWeight:'500',
  },
});
