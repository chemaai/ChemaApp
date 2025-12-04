import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuthContext } from '../../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
                backgroundColor: '#FFFFFF',
                borderColor: '#D9D9D9',
                color: '#000000',
              }
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)'}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: '#FFFFFF',
                borderColor: '#D9D9D9',
                color: '#000000',
              }
            ]}
            placeholder="Password"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)'}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: '#F1F1F1',
              borderWidth: 1,
              borderColor: '#D9D9D9',
              height: 48,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
            },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <Pressable
            onPress={() => router.push('/auth/Register')}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.70)' }]}>
              Create an account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/auth/ForgotPassword')}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.70)' }]}>
              Forgot password?
            </Text>
          </Pressable>
        </View>

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
  linksContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
  },
  backLink: {
    marginTop: 32,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
  },
});
