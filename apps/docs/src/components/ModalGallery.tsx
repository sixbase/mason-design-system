import { useState } from 'react';
import {
  Button,
  Input,
  Text,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@ds/components';

export function ModalDefault() {
  return (
    <Modal>
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
          <div className="ds-gallery-stack">
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
  );
}

export function ModalSizes() {
  return (
    <div className="ds-gallery-row">
      <Modal>
        <ModalTrigger asChild>
          <Button variant="secondary">Small (400px)</Button>
        </ModalTrigger>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Delete item?</ModalTitle>
            <ModalDescription>
              This action cannot be undone.
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

      <Modal>
        <ModalTrigger asChild>
          <Button variant="secondary">Medium (520px)</Button>
        </ModalTrigger>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Edit profile</ModalTitle>
            <ModalDescription>Default size — suitable for forms and confirmations.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Text>Form content goes here.</Text>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal>
        <ModalTrigger asChild>
          <Button variant="secondary">Large (680px)</Button>
        </ModalTrigger>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Order #12345</ModalTitle>
            <ModalDescription>Order placed on March 10, 2026 — 3 items</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Text>Organic Cotton T-Shirt × 2 — $58.00</Text>
            <Text>Merino Wool Beanie × 1 — $32.00</Text>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Close</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export function ModalConfirmation() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="destructive">Remove from cart</Button>
      </ModalTrigger>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Remove item?</ModalTitle>
          <ModalDescription>
            "Organic Cotton T-Shirt" will be removed from your cart.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Keep item</Button>
          </ModalClose>
          <Button variant="destructive">Remove</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function ModalFullScreenMobile() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open size guide</Button>
      </ModalTrigger>
      <ModalContent fullScreenOnMobile>
        <ModalHeader>
          <ModalTitle>Size guide</ModalTitle>
          <ModalDescription>
            Below 640px this modal fills the screen and its padding respects
            device safe areas. Resize the viewport to see it.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="ds-gallery-stack">
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
  );
}

export function ModalControlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open (controlled)</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Controlled modal</ModalTitle>
            <ModalDescription>
              The open state is managed externally via useState.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Text>
              Open state: <code>{String(open)}</code>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
