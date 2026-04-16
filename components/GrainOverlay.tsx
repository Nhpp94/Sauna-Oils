import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect, Defs, Filter, FeTurbulence, FeColorMatrix } from 'react-native-svg';

export default function GrainOverlay() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Filter id="grain" x="0%" y="0%" width="100%" height="100%">
          <FeTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <FeColorMatrix type="saturate" values="0" />
        </Filter>
      </Defs>
      <Rect width="100%" height="100%" filter="url(#grain)" opacity="0.035" />
    </Svg>
  );
}
