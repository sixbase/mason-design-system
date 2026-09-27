import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
import { Divider } from '../divider';
import { Input } from '../input';
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '../popover';
import { Text } from '../typography/Typography';
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      // Every state opens on load (so it can be seen without a click); in
      // their own frames they don't cover the docs page or each other.
      story: { inline: false, iframeHeight: 560 },
      description: {
        component:
          'A window that opens over the page and must be closed before you carry on — confirmations, forms, size guides.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button>Edit profile</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit profile</ModalTitle>
          <ModalDescription>
            Make changes to your profile. Click save when you're done.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <Input label="Name" defaultValue="Maya Chen" />
            <Input label="Email" type="email" defaultValue="maya@example.com" />
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Cancel</Button>
          </ModalClose>
          <Button>Save changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const Small: Story = {
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button variant="destructive">Delete address</Button>
      </ModalTrigger>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Delete this address?</ModalTitle>
          <ModalDescription>
            12 Alder Street, Portland will be removed from your saved addresses.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Cancel</Button>
          </ModalClose>
          <Button variant="destructive">Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const Large: Story = {
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button>View Details</Button>
      </ModalTrigger>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Order #12345</ModalTitle>
          <ModalDescription>
            Order placed on March 10, 2026 — 3 items
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Text>Minimal Canvas Tote × 1 — $48.00</Text>
            <Text>Handmade Ceramic Mug × 2 — $64.00</Text>
            <Text>Merino Wool Beanie × 1 — $32.00</Text>
            <Divider />
            <Text weight="semibold">Total: $144.00</Text>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Close</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const FullScreenOnMobile: Story = {
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button>Open full-screen modal</Button>
      </ModalTrigger>
      <ModalContent fullScreenOnMobile>
        <ModalHeader>
          <ModalTitle>Size guide</ModalTitle>
          <ModalDescription>
            Below 640px this modal fills the screen — padding respects device
            safe areas. Resize the viewport to see it.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <Input label="Chest (cm)" defaultValue="96" />
            <Input label="Waist (cm)" defaultValue="81" />
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Close</Button>
          </ModalClose>
          <Button>Find my size</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

/** Opened and closed by the page (`open` + `onOpenChange`) instead of its own trigger. */
export const Controlled: Story = {
  name: 'Opened by the page',
  render: function ControlledStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open newsletter sign-up</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Get 10% off your first order</ModalTitle>
              <ModalDescription>
                New arrivals and restocks, once a month. No spam.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <Input label="Email" type="email" placeholder="you@example.com" />
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                No thanks
              </Button>
              <Button onClick={() => setOpen(false)}>Subscribe</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  },
};

export const LongContent: Story = {
  name: 'Long content (body scrolls)',
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button>Read the returns policy</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Returns policy</ModalTitle>
          <ModalDescription>Header and footer stay put; only the body scrolls.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Text key={i}>
                {i + 1}. Items can be returned within 30 days of delivery, unworn and with
                their tags attached. Refunds go back to the original payment method.
              </Text>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button>Got it</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const WithPopover: Story = {
  name: 'Popover inside a modal (stacking)',
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button>Open modal</Button>
      </ModalTrigger>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Choose a size</ModalTitle>
          <ModalDescription>The popover must open above the modal, not behind it.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Popover defaultOpen>
            <PopoverTrigger asChild>
              <Button variant="secondary">Size guide</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              Between sizes? Size up for a relaxed fit.
            </PopoverContent>
          </Popover>
        </ModalBody>
      </ModalContent>
    </Modal>
  ),
};
