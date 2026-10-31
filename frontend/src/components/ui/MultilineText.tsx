import { Fragment } from 'react';

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
