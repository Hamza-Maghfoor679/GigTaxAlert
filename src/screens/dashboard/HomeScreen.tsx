import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { DeadlineList } from '@/components/deadlines/DeadlineList';
import { Button } from '@/components/ui/Button';
import type { DashboardStackParamList } from '@/navigation/types';
import { useDeadlines } from '@/hooks/useDeadlines';
import { spacing, typography, useThemeColors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export type HomeScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'Home'
>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { deadlines, refetch } = useDeadlines();
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: spacing.sm,  
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>Dashboard</Text>
      <Button label="Refresh deadlines" onPress={() => void refetch()} />
      <DeadlineList
        deadlines={deadlines}
        onItemPress={(item) =>
          navigation.navigate('DeadlineDetail', { deadlineId: item.id })
        }
      />
    </SafeAreaView>
  );
}
