'use client';

import { useState } from 'react';

export default function SubApp() {
  const [state, setState] = useState(0);
  return (
    <div>
      <h1>SubApp</h1>
      <p>{state}</p>
      <button onClick={() => setState(state + 1)}>Click</button>
    </div>
  );
}
