import { Redirect } from 'expo-router';
import { useUser } from '../context/UserContext';

export default function RootIndex() {
  const { isOnboarded } = useUser();
  return <Redirect href={isOnboarded ? '/(tabs)' : '/onboarding'} />;
}
