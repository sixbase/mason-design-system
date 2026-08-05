import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
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
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open Modal</Button>
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
            <Input label="Name" defaultValue="Jane Doe" />
            <Input label="Email" defaultValue="jane@example.com" />
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
    <Modal>
      <ModalTrigger asChild>
        <Button variant="destructive">Delete item</Button>
      </ModalTrigger>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Delete this item?</ModalTitle>
          <ModalDescription>
            This action cannot be undone. The item will be permanently removed.
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
    <Modal>
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
            <p style={{ margin: 0 }}>
              Organic Cotton T-Shirt × 2 — $58.00
            </p>
            <p style={{ margin: 0 }}>
              Merino Wool Beanie × 1 — $32.00
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--spacing-1) 0' }} />
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
              Total: $90.00
            </p>
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
    <Modal>
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

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Controlled open</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Controlled modal</ModalTitle>
              <ModalDescription>
                This modal's open state is managed externally.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p style={{ margin: 0 }}>
                Open state: <code>{String(open)}</code>
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close programmatically
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  },
};
