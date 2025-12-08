import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'chemaapp://auth/reset-password',
      });
      
      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image
          source={colorScheme === 'dark' 
            ? require('../../assets/images/chema_logo_dark.svg') 
            : require('../../assets/images/chema_logo.svg')} 
          style={{
            width: 200,
            height: undefined,
            aspectRatio: 1,
            marginBottom: 60,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                borderColor: isDark ? '#555555' : '#D9D9D9',
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)'}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
              setSuccess(false);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {success ? (
          <Text style={[styles.successText, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.80)' }]}>
            Password reset email sent.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: isDark ? '#0D0D0D' : '#F1F1F1',
              borderWidth: 1,
              borderColor: isDark ? '#555555' : '#D9D9D9',
              height: 48,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
            },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSendResetEmail}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {loading ? 'Sending...' : 'Send reset email'}
          </Text>
        </TouchableOpacity>

        <Pressable
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Text style={[styles.backLinkText, { color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }]}>
            Back
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginTop: SCREEN_HEIGHT * 0.20,
    marginBottom: 48,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backLink: {
    marginTop: 32,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
  },
});
