import React, { forwardRef, useMemo } from 'react';
import { buildLines, WIDTH, HEIGHT } from './art';

export const Artwork = forwardRef(function Artwork({ params, ink, paper, time }, ref) {
  const lines = useMemo(() => buildLines(params, time), [params, time]);
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Generative line art made of stacked, wavy horizontal lines"
    >
      <rect width={WIDTH} height={HEIGHT} fill={paper} />
      <g fill="none" stroke={ink} strokeWidth={params.stroke} strokeLinecap="round" strokeLinejoin="round">
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            {params.occlude && (
              <path d={`${l.d}L${l.last[0].toFixed(1)} ${HEIGHT}L${l.first[0].toFixed(1)} ${HEIGHT}Z`} fill={paper} stroke="none" />
            )}
            <path d={l.d} strokeOpacity={params.depthFade ? 0.3 + 0.7 * l.t : 1} />
          </React.Fragment>
        ))}
      </g>
    </svg>
  );
});
