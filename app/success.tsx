import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function UpgradeSuccess() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDark ? '#FFFFFF' : '#000000' }
      ]}>
        Your future begins now
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isDark ? '#FFFFFF' : '#000000'
          }
        ]}
        onPress={() => router.push('/chat')}
      >
        <Text style={[
          styles.buttonText,
          { color: isDark ? '#000000' : '#FFFFFF' }
        ]}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600'
  }
});

