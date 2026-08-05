import { Input } from '@ds/components';
import { Preview } from './Preview';

export function InputStates() {
  return (
    <Preview stack>
      <div className="ds-gallery-input">
        <Input label="Email address" type="email" placeholder="you@example.com" />
      </div>
      <div className="ds-gallery-input">
        <Input label="Password" type="password" hint="Must be at least 8 characters" />
      </div>
      <div className="ds-gallery-input">
        <Input label="Email" error="Please enter a valid email address" />
      </div>
      <div className="ds-gallery-input">
        <Input label="Full name" required />
      </div>
      <div className="ds-gallery-input">
        <Input label="Username" defaultValue="jane_smith" disabled />
      </div>
      <div className="ds-gallery-input">
        <Input label="Order number" defaultValue="MS-1042" readOnly hint="Read-only — selectable but not editable" />
      </div>
    </Preview>
  );
}
