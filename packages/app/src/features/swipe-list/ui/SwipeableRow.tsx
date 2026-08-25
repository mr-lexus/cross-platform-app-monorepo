import { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  COLLAPSE_DURATION,
  ROW_HEIGHT,
  SLIDE_OUT_DURATION,
  SNAP_BACK_DURATION,
  SNAP_BACK_EASING,
  SWIPE_THRESHOLD,
} from "../../../shared/theme";
import { isDeleteCommitted } from "../model/swipeGuards";
import type { MessageItem } from "../model/types";
import { RowContent } from "./RowContent";
import { SwipeBackground } from "./SwipeBackground";

type SwipeableRowProps = {
  item: MessageItem;
  onDelete: (id: string) => void;
  containerWidth: number;
};

function SwipeableRowImpl({
  item,
  onDelete,
  containerWidth,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue(ROW_HEIGHT);
  const isDeleting = useSharedValue(false);
  // Exactly-once commit gate: flipped before onDelete is handed off, by
  // whichever path wins (animation completion or the unmount fallback), so a
  // completed deletion commits exactly once even though both paths exist.
  const isCommitSent = useSharedValue(false);

  const pan = usePanGesture({
    activeOffsetX: [-10, 10],
    failOffsetY: [-5, 5],
    onUpdate: (event) => {
      "worklet";
      if (isDeleting.value) {
        return;
      }
      translateX.value = event.translationX;
    },
    onDeactivate: (event) => {
      "worklet";
      if (isDeleting.value) {
        return;
      }
      if (event.canceled) {
        translateX.value = withTiming(0, {
          duration: SNAP_BACK_DURATION,
          easing: SNAP_BACK_EASING,
        });
        return;
      }
      if (isDeleteCommitted(event.translationX, SWIPE_THRESHOLD)) {
        isDeleting.value = true;
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * containerWidth,
          { duration: SLIDE_OUT_DURATION },
          (slideFinished) => {
            if (!slideFinished) {
              return;
            }
            rowHeight.value = withTiming(
              0,
              { duration: COLLAPSE_DURATION },
              (collapseFinished) => {
                if (!collapseFinished || isCommitSent.value) {
                  return;
                }
                isCommitSent.value = true;
                scheduleOnRN(onDelete, item.id);
              },
            );
          },
        );
        return;
      }
      translateX.value = withTiming(0, {
        duration: SNAP_BACK_DURATION,
        easing: SNAP_BACK_EASING,
      });
    },
  });

  useEffect(() => {
    return () => {
      // Fallback for a row that leaves the tree while its deletion animation
      // is still pending and the commit has not been handed to React yet.
      if (isDeleting.value && !isCommitSent.value) {
        isCommitSent.value = true;
        onDelete(item.id);
      }
    };
  }, [isDeleting, isCommitSent, item.id, onDelete]);

  const wrapperStyle = useAnimatedStyle(() => ({
    height: rowHeight.value,
    opacity: interpolate(
      rowHeight.value,
      [0, ROW_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, wrapperStyle]}>
      <SwipeBackground translateX={translateX} threshold={SWIPE_THRESHOLD} />
      <GestureDetector gesture={pan} touchAction="pan-y">
        <Animated.View style={[styles.foreground, foregroundStyle]}>
          <RowContent item={item} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/**
 * Memoized row: props stay referentially stable across deletions
 * (identity-preserving filter + useCallback'd onDelete), so only the removed
 * row leaves the tree and neighbors never re-render.
 */
export const SwipeableRow = memo(SwipeableRowImpl);

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  foreground: {
    backgroundColor: "#ffffff",
  },
});
