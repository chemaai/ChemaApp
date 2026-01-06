import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuthContext } from '../../context/AuthContext';
import { useColorScheme } from '../../hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(offset.value, { duration: 250 }) }],
  }));

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      offset.value = -Math.min(e.endCoordinates.height * 0.22, 120);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      offset.value = 0;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[{ width: '100%', alignItems: 'center', paddingHorizontal: 24 }, animatedStyle]}>
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
                borderColor: isDark ? '#3A3A3A' : '#000000',
                borderWidth: 1,
                borderRadius: 16,
                color: isDark ? '#FFFFFF' : '#000000',
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
                backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                borderColor: isDark ? '#3A3A3A' : '#000000',
                borderWidth: 1,
                borderRadius: 16,
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder="Password"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)'}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            passwordRules={null}
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
              backgroundColor: '#1A1A1A',
              borderWidth: 0,
              borderColor: 'transparent',
              height: 48,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
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
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    marginTop: 0,
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
