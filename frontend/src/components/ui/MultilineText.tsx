import { Fragment } from 'react';

/**
 * Renders a "\n"-separated string as real <br/>-separated lines instead of relying on
 * `white-space: pre-line` around a single text node. Google Translate replaces whole text
 * nodes, and a raw "\n" inside one collapses translation into a single line while leaving
 * the original line's reserved whitespace behind — a real <br/> keeps each line an
 * independent, correctly-translated node.
 */
export const MultilineText = ({ text }: { text: string }) => (
  <>
    {text.split('\n').map((line, i, arr) => (
      <Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </Fragment>
    ))}
  </>
);
