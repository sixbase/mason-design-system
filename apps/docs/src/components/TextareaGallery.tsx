import { Textarea } from '@ds/components';
import { Preview } from './Preview';

export function TextareaStates() {
  return (
    <Preview stack>
      <Textarea label="Order notes" placeholder="Delivery instructions, gate codes, etc." />
      <Textarea label="Message" required placeholder="How can we help?" />
      <Textarea label="Archived note" defaultValue="This order shipped on March 3." disabled />
    </Preview>
  );
}

export function TextareaWithText() {
  return (
    <Preview stack>
      <Textarea
        label="Gift message"
        hint="Printed on the packing slip — max 200 characters"
      />
      <Textarea
        label="Review"
        defaultValue="Great!"
        error="Please write at least 20 characters"
      />
    </Preview>
  );
}

export function TextareaAutoResize() {
  return (
    <Preview stack>
      <Textarea
        label="Gift message"
        autoResize
        rows={2}
        placeholder="Grows as you type..."
        hint="The field expands to fit your message"
      />
    </Preview>
  );
}
