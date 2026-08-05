import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ds/components';
import { useState } from 'react';
import { Preview } from './Preview';

export function DropdownMenuDefault() {
  return (
    <Preview>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Orders</DropdownMenuItem>
          <DropdownMenuItem>Addresses</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Preview>
  );
}

export function DropdownMenuDestructive() {
  return (
    <Preview>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Order #1042</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Order actions</DropdownMenuLabel>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Track shipment</DropdownMenuItem>
          <DropdownMenuItem>Download invoice</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Cancel order</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Preview>
  );
}

export function DropdownMenuSelection() {
  const [inStock, setInStock] = useState(true);
  const [onSale, setOnSale] = useState(false);
  const [sort, setSort] = useState('featured');

  return (
    <Preview>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Filters</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Availability</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={inStock} onCheckedChange={setInStock}>
            In stock only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={onSale} onCheckedChange={setOnSale}>
            On sale
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Sort by</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="newest">Newest arrivals</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="price-asc">Price: low to high</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="price-desc">Price: high to low</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Preview>
  );
}

export function DropdownMenuDisabled() {
  return (
    <Preview>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Reorder</DropdownMenuItem>
          <DropdownMenuItem disabled>Return items (window closed)</DropdownMenuItem>
          <DropdownMenuItem>Contact support</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Preview>
  );
}
