/**
 * Consistency line-ups — the same concern across different components,
 * side by side, so drift is visible at a glance.
 */
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Heading,
  Input,
  ProgressBar,
  QuantitySelector,
  RadioGroup,
  RadioGroupItem,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectItem,
  Slider,
  StockIndicator,
  Switch,
  Tag,
  Text,
  Textarea,
} from '@ds/components';
import './specimens.css';

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="wb-sheet__section">
      <Heading as="h2" size="xl">
        {title}
      </Heading>
      {note && (
        <Text size="sm" muted className="wb-sheet__note">
          {note}
        </Text>
      )}
      {children}
    </section>
  );
}

// ─── Control sizes ──────────────────────────────────────────

function Qty({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const [v, setV] = useState(1);
  return <QuantitySelector size={size} value={v} onChange={setV} />;
}

export function ControlSizes() {
  const sizes = ['sm', 'md', 'lg'] as const;
  return (
    <div className="wb-sheet">
      <Section
        title="Control heights"
        note="Every control in a row shares one height token (34 / 42 / 55px). Each should exactly fill the dashed band behind it."
      >
        {sizes.map((size) => (
          <div key={size} className={['wb-row', 'wb-lineup', `wb-lineup--${size}`].join(' ')}>
            <span className="wb-row__label">{size}</span>
            <Button size={size}>Button</Button>
            <Button size={size} variant="secondary">
              Secondary
            </Button>
            <div className="wb-lineup__field">
              <Input size={size} placeholder="Input" aria-label={`Input ${size}`} />
            </div>
            <div className="wb-lineup__field">
              <Select size={size} placeholder="Select" aria-label={`Select ${size}`} fullWidth>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
              </Select>
            </div>
            <Qty size={size} />
            {size !== 'lg' ? (
              <SegmentedControl size={size} defaultValue="grid" aria-label={`View ${size}`}>
                <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
                <SegmentedControlItem value="list">List</SegmentedControlItem>
              </SegmentedControl>
            ) : (
              <Text size="sm" muted>
                Segmented control has no large size
              </Text>
            )}
          </div>
        ))}
      </Section>

      <Section title="Small labels" note="Badges and tags sit side by side in filters and cards — their heights and text baselines should match.">
        {(['sm', 'md'] as const).map((size) => (
          <div key={size} className="wb-row wb-lineup wb-lineup--none">
            <span className="wb-row__label">{size}</span>
            <Badge size={size}>Badge</Badge>
            <Badge size={size} variant="outline">
              Outline
            </Badge>
            <Tag size={size}>Tag</Tag>
            <Tag size={size} variant="outline">
              Outline tag
            </Tag>
            <Tag size={size} onDismiss={() => {}}>
              Removable
            </Tag>
          </div>
        ))}
      </Section>

      <Section title="Toggles">
        {(['sm', 'md'] as const).map((size) => (
          <div key={size} className="wb-row wb-lineup wb-lineup--none">
            <span className="wb-row__label">{size}</span>
            <Checkbox size={size} label="Checkbox" defaultChecked />
            <Switch size={size} label="Switch" defaultChecked />
            <RadioGroup size={size} defaultValue="a" aria-label={`Radio ${size}`}>
              <RadioGroupItem value="a" label="Radio" />
            </RadioGroup>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─── Status colors ──────────────────────────────────────────

export function StatusColors() {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="wb-status">
      <span className="wb-row__label">{label}</span>
      <div className="wb-status__value">{children}</div>
    </div>
  );
  return (
    <div className="wb-sheet">
      <Section
        title="The same status, everywhere"
        note="Each row is one meaning. The color should read as the same family in every component, in both themes."
      >
        <Row label="success">
          <div className="wb-row">
            <Badge variant="success">In stock</Badge>
            <StockIndicator status="in-stock" />
          </div>
          <ProgressBar value={100} variant="success" label="Free shipping unlocked" />
          <Alert variant="success" title="Order placed">
            We sent a confirmation to your email.
          </Alert>
        </Row>
        <Row label="warning">
          <div className="wb-row">
            <Badge variant="warning">Low stock</Badge>
            <StockIndicator status="low-stock" />
          </div>
          <Alert variant="warning" title="Only 2 left">
            Order soon — this item sells out quickly.
          </Alert>
        </Row>
        <Row label="error">
          <div className="wb-row">
            <StockIndicator status="out-of-stock" />
            <Button variant="destructive" size="sm">
              Remove
            </Button>
          </div>
          <Alert variant="destructive" title="Payment failed">
            Your card was declined. Try another payment method.
          </Alert>
        </Row>
        <Row label="sale">
          <Text size="sm" muted>
            Sale borrows the error red — check it still reads as a price signal, not a warning.
          </Text>
          <div className="wb-row">
            <Badge variant="destructive">Sale</Badge>
          </div>
        </Row>
        <Row label="info">
          <Text size="sm" muted>
            There is no info badge; the neutral badge stands in.
          </Text>
          <div className="wb-row">
            <Badge variant="secondary">New</Badge>
          </div>
          <Alert variant="info" title="Shipping update">
            Holiday orders placed after Dec 18 arrive in January.
          </Alert>
        </Row>
      </Section>
    </div>
  );
}

// ─── Form states ────────────────────────────────────────────

export function FormStates() {
  const [qty, setQty] = useState(2);
  const states = [
    { key: 'empty', label: 'Empty' },
    { key: 'filled', label: 'Filled' },
    { key: 'hint', label: 'With hint' },
    { key: 'error', label: 'Error' },
    { key: 'disabled', label: 'Disabled' },
  ] as const;
  return (
    <div className="wb-sheet">
      <Section
        title="Every field, every state"
        note="Labels, hints and errors should sit at the same distances in every field. Tab through them to check focus rings."
      >
        {states.map(({ key, label }) => (
          <div key={key} className="wb-sheet__section">
            <Heading as="h3" size="xl">
              {label}
            </Heading>
            <div className="wb-grid wb-grid--wide">
              <Input
                label="Email"
                placeholder="you@example.com"
                defaultValue={key === 'filled' ? 'alvin@example.com' : key === 'error' ? 'alvin@' : undefined}
                hint={key === 'hint' ? 'We only use this for your receipt.' : undefined}
                error={key === 'error' ? 'Enter a complete email address.' : undefined}
                disabled={key === 'disabled'}
              />
              <Select
                label="Size"
                placeholder="Choose a size"
                defaultValue={key === 'filled' ? 'm' : undefined}
                hint={key === 'hint' ? 'Runs small — size up.' : undefined}
                error={key === 'error' ? 'Choose a size to continue.' : undefined}
                disabled={key === 'disabled'}
              >
                <SelectItem value="s">Small</SelectItem>
                <SelectItem value="m">Medium</SelectItem>
                <SelectItem value="l">Large</SelectItem>
              </Select>
              <Textarea
                label="Gift note"
                placeholder="Add a message"
                defaultValue={key === 'filled' ? 'Happy birthday!' : key === 'error' ? 'Happy birthday! '.repeat(14) : undefined}
                hint={key === 'hint' ? 'Printed on the packing slip.' : undefined}
                error={key === 'error' ? 'Keep it under 200 characters.' : undefined}
                disabled={key === 'disabled'}
              />
              <div className="wb-sheet__section">
                <Checkbox
                  label="Subscribe to restock alerts"
                  defaultChecked={key === 'filled'}
                  hint={key === 'hint' ? 'One email per restock.' : undefined}
                  error={key === 'error' ? 'Required to continue.' : undefined}
                  disabled={key === 'disabled'}
                />
                <Switch
                  label="Gift wrap"
                  defaultChecked={key === 'filled'}
                  hint={key === 'hint' ? 'Adds $5.' : undefined}
                  error={key === 'error' ? 'Not available for this item.' : undefined}
                  disabled={key === 'disabled'}
                />
              </div>
              <RadioGroup
                label="Shipping"
                defaultValue={key === 'filled' || key === 'hint' ? 'standard' : undefined}
                hint={key === 'hint' ? 'Arrives in 4–7 days.' : undefined}
                error={key === 'error' ? 'Choose a shipping speed.' : undefined}
                disabled={key === 'disabled'}
              >
                <RadioGroupItem value="standard" label="Standard" />
                <RadioGroupItem value="express" label="Express" />
              </RadioGroup>
              <div className="wb-sheet__section">
                <Slider label="Price" defaultValue={[40]} max={200} disabled={key === 'disabled'} />
                <QuantitySelector value={qty} onChange={setQty} disabled={key === 'disabled'} aria-label="Quantity" />
              </div>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
