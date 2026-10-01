import { Fragment } from 'react';
import { ticker } from '../lib/data';

/* lib/data.js lists the 8 occasions twice. The marquee animates the track by
   -50%, so each half must be wider than the screen or a blank gap appears on
   the right (it did above ~1850px). Rendering the 8 unique items 4 times makes
   each half ~3700px wide. The track is aria-hidden: purely decorative. */
const unique = [...new Set(ticker)];
const items = [...unique, ...unique, ...unique, ...unique];

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-scroll">
        <div className="ticker-track">
          {items.map((label, i) => (
            <Fragment key={i}>
              <span className="ticker-item">{label}</span>
              <span className="ticker-dot">●</span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
