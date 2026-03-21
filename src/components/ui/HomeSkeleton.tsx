import { View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { homeStyles } from '@/styles/MainStackStyles/HomeStyles';
import { radius, s, spacing, vs } from '@/theme';

type Props = {
  st: ReturnType<typeof homeStyles>;
};

/**
 * HomeSkeleton
 *
 * Screen-specific loading placeholder that mirrors the HomeScreen layout:
 * header → date pill → 3 summary cards → hero → 3 list rows.
 */
export function HomeSkeleton({ st }: Props) {
  return (
    <>
      {/* Header */}
      <View style={[st.header, { gap: vs(6) }]}>
        <View style={{ gap: vs(6) }}>
          <Skeleton width={s(80)}  height={vs(10)} />
          <Skeleton width={s(140)} height={vs(18)} />
        </View>
        <View style={st.headerRight}>
          <Skeleton width={s(40)} height={s(40)} borderRadius={s(40)} />
          <Skeleton width={s(40)} height={s(40)} borderRadius={s(40)} />
          <Skeleton width={s(40)} height={s(40)} borderRadius={s(40)} />
        </View>
      </View>

      {/* Date pill */}
      <Skeleton
        width={s(190)}
        height={vs(22)}
        borderRadius={radius.full}
        style={{ marginHorizontal: spacing.md, marginBottom: vs(16) }}
      />

      {/* Summary cards */}
      <View style={st.summaryRow}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width="100%" height={vs(90)} style={{ flex: 1, borderRadius: s(12) }} />
        ))}
      </View>

      {/* Hero */}
      <Skeleton
        width="auto"
        height={vs(140)}
        borderRadius={s(24)}
        style={{ marginHorizontal: spacing.md, marginBottom: vs(20) }}
      />

      {/* List rows */}
      {[0, 1, 2].map((i) => (
        <Skeleton
          key={i}
          width="auto"
          height={vs(64)}
          borderRadius={s(14)}
          style={{ marginHorizontal: spacing.md, marginBottom: vs(8) }}
        />
      ))}
    </>
  );
}