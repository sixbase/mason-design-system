import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Text } from '@ds/components';
import { useState } from 'react';
import { Preview } from './Preview';

export function AccordionDefault() {
  return (
    <Preview stack>
      <div className="ds-gallery-full">
        <Accordion type="single" collapsible>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
            <AccordionContent>
              Free standard shipping on orders over $50. Express shipping available
              at checkout. Most orders arrive within 3–5 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
            <AccordionContent>
              We accept returns within 30 days of purchase. Items must be unworn
              and in original packaging. Free return shipping on all orders.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger>Care Instructions</AccordionTrigger>
            <AccordionContent>
              Machine wash cold with like colors. Tumble dry low. Do not bleach.
              Iron on low heat if needed.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Preview>
  );
}

export function AccordionMultiple() {
  return (
    <Preview stack>
      <div className="ds-gallery-full">
        <Accordion type="multiple" defaultValue={['features', 'specs']}>
          <AccordionItem value="features">
            <AccordionTrigger>Features</AccordionTrigger>
            <AccordionContent>
              Lightweight aramid fiber construction. MagSafe compatible.
              Precision-cut for all ports and buttons.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="specs">
            <AccordionTrigger>Specifications</AccordionTrigger>
            <AccordionContent>
              Weight: 12g. Thickness: 0.65mm. Material: Aramid fiber.
              Compatible with iPhone 17 Pro Max.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="warranty">
            <AccordionTrigger>Warranty</AccordionTrigger>
            <AccordionContent>
              Covered by a 1-year limited warranty against manufacturing defects.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Preview>
  );
}

export function AccordionSizes() {
  return (
    <Preview stack>
      <div className="ds-gallery-full">
        <Text size="sm" className="ds-gallery-label">Small</Text>
        <Accordion type="single" collapsible size="sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>Small accordion item</AccordionTrigger>
            <AccordionContent>Compact content for dense layouts.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="ds-gallery-full">
        <Text size="sm" className="ds-gallery-label">Medium (default)</Text>
        <Accordion type="single" collapsible size="md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Medium accordion item</AccordionTrigger>
            <AccordionContent>Default size for most use cases.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="ds-gallery-full">
        <Text size="sm" className="ds-gallery-label">Large</Text>
        <Accordion type="single" collapsible size="lg">
          <AccordionItem value="item-1">
            <AccordionTrigger>Large accordion item</AccordionTrigger>
            <AccordionContent>Spacious layout for prominent sections.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Preview>
  );
}

export function AccordionWithCheckbox() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    essential: true,
    functional: false,
    performance: false,
    targeting: false,
  });

  return (
    <Preview stack>
      <div className="ds-gallery-full">
        <Accordion type="multiple" size="sm" bordered>
          <AccordionItem value="essential">
            <AccordionTrigger
              checked={checked.essential}
              checkboxDisabled
              checkboxLabel="Strictly Necessary Cookies"
            >
              Strictly Necessary Cookies
            </AccordionTrigger>
            <AccordionContent>
              These cookies are essential for the website to function and cannot be switched off.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="functional">
            <AccordionTrigger
              checked={checked.functional}
              onCheckedChange={(c) => setChecked((s) => ({ ...s, functional: c === true }))}
              checkboxLabel="Functional Cookies"
            >
              Functional Cookies
            </AccordionTrigger>
            <AccordionContent>
              These cookies enable enhanced functionality and personalization.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="performance">
            <AccordionTrigger
              checked={checked.performance}
              onCheckedChange={(c) => setChecked((s) => ({ ...s, performance: c === true }))}
              checkboxLabel="Performance Cookies"
            >
              Performance Cookies
            </AccordionTrigger>
            <AccordionContent>
              These cookies help us understand how visitors interact with the website.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="targeting">
            <AccordionTrigger
              checked={checked.targeting}
              onCheckedChange={(c) => setChecked((s) => ({ ...s, targeting: c === true }))}
              checkboxLabel="Targeting Cookies"
            >
              Targeting Cookies
            </AccordionTrigger>
            <AccordionContent>
              These cookies are used to deliver personalized advertisements.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Preview>
  );
}

export function AccordionBordered() {
  return (
    <Preview stack>
      <div className="ds-gallery-full">
        <Accordion type="single" collapsible bordered>
          <AccordionItem value="faq-1">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent>
              We accept Visa, Mastercard, American Express, and PayPal.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>How long does shipping take?</AccordionTrigger>
            <AccordionContent>
              Standard shipping takes 3–5 business days. Express shipping is available at checkout.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>Can I track my order?</AccordionTrigger>
            <AccordionContent>
              Yes, you'll receive a tracking number via email once your order ships.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Preview>
  );
}
