import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setSession = useAuthStore(state => state.setSession);
    const demoLogin = useAuthStore(state => state.demoLogin);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
            // Check role before setting session
            const { data: userProfile } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.session.user.id)
                .single();

            if (userProfile?.role === 'doctor' || userProfile?.role === 'admin') {
                setSession(data.session);
            } else {
                await supabase.auth.signOut();
                Alert.alert('Access Denied', 'This portal is for Doctors/Admins only.');
            }
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Doctor Admin</Text>
                        <Text variant="titleMedium" style={{ color: theme.colors.secondary, marginTop: 8 }}>Authorized Access Only</Text>
                    </View>

                    <Surface style={styles.formCard} elevation={2}>
                        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Admin Login</Text>

                        <TextInput
                            label="Email"
                            mode="outlined"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                            left={<TextInput.Icon icon="email" />}
                        />

                        <TextInput
                            label="Password"
                            mode="outlined"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                            left={<TextInput.Icon icon="lock" />}
                        />

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            contentStyle={{ height: 50 }}
                        >
                            Login
                        </Button>

                        <View style={{ marginBottom: 16 }}>
                            <Button
                                mode="outlined"
                                onPress={() => demoLogin('doctor')}
                                style={{ width: '100%' }}
                            >
                                Demo Doctor
                            </Button>
                        </View>

                        <Button
                            onPress={() => navigation.navigate('Register')}
                            style={styles.linkButton}
                            textColor={theme.colors.primary}
                        >
                            Create Account
                        </Button>
                    </Surface>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    formCard: {
        padding: 24,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    linkButton: {
        marginTop: 8,
    },
});
