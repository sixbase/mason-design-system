import { render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

// The current page marker as assistive tech finds it: the aria-current
// element in the desktop row. Its text must read "Page N" — a bare "5"
// was all screen readers heard while the label sat on a role-less span.
const currentPageIn = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('.ds-pagination__desktop [aria-current="page"]');

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders a nav element with pagination role', () => {
      render(<Pagination currentPage={1} totalPages={5} />);
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('renders nothing when totalPages is 1', () => {
      const { container } = render(<Pagination currentPage={1} totalPages={1} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when totalPages is 0', () => {
      const { container } = render(<Pagination currentPage={1} totalPages={0} />);
      expect(container.firstChild).toBeNull();
    });

    // NaN slipped past `<= 1` ("Page NaN of NaN"); Infinity showed a last
    // page called "Infinity".
    it.each([Number.NaN, Infinity])('renders nothing when totalPages is %s', (totalPages) => {
      const { container } = render(<Pagination currentPage={1} totalPages={totalPages} baseUrl="/c" />);
      expect(container.firstChild).toBeNull();
    });

    it('applies size class', () => {
      render(<Pagination currentPage={1} totalPages={5} size="sm" />);
      expect(screen.getByRole('navigation')).toHaveClass('ds-pagination--sm');
    });

    it('defaults to md size', () => {
      render(<Pagination currentPage={1} totalPages={5} />);
      expect(screen.getByRole('navigation')).toHaveClass('ds-pagination--md');
    });

    it('merges custom className', () => {
      render(<Pagination currentPage={1} totalPages={5} className="custom" />);
      expect(screen.getByRole('navigation')).toHaveClass('custom');
    });
  });

  describe('page numbers', () => {
    it('shows all pages when totalPages <= 7', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      for (let i = 1; i <= 5; i++) {
        if (i === 3) {
          expect(currentPageIn(nav)).toHaveTextContent(/^Page 3$/);
        } else {
          expect(within(nav).getByLabelText(`Go to page ${i}`)).toBeInTheDocument();
        }
      }
    });

    it('shows ellipsis for large page counts', () => {
      render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      // Desktop view should contain ellipsis characters
      const desktop = nav.querySelector('.ds-pagination__desktop');
      expect(desktop?.textContent).toContain('…');
      // Decorative: "dot dot dot" between page links is noise when read aloud.
      const ellipses = nav.querySelectorAll('.ds-pagination__ellipsis');
      expect(ellipses).toHaveLength(2);
      ellipses.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
    });

    it('always shows first and last page', () => {
      render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getByLabelText('Go to page 1')).toBeInTheDocument();
      expect(within(nav).getByLabelText('Go to page 20')).toBeInTheDocument();
    });

    it('shows one sibling each side of the current page by default', () => {
      render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />);
      const desktop = within(
        screen.getByRole('navigation').querySelector('.ds-pagination__desktop') as HTMLElement,
      );
      expect(desktop.getByLabelText('Go to page 9')).toBeInTheDocument();
      expect(desktop.getByLabelText('Go to page 11')).toBeInTheDocument();
      expect(desktop.queryByLabelText('Go to page 8')).not.toBeInTheDocument();
      expect(desktop.queryByLabelText('Go to page 12')).not.toBeInTheDocument();
    });

    it('widens the window with siblingCount', () => {
      render(
        <Pagination currentPage={10} totalPages={20} siblingCount={2} onPageChange={() => {}} />,
      );
      const desktop = within(
        screen.getByRole('navigation').querySelector('.ds-pagination__desktop') as HTMLElement,
      );
      expect(desktop.getByLabelText('Go to page 8')).toBeInTheDocument();
      expect(desktop.getByLabelText('Go to page 12')).toBeInTheDocument();
      expect(desktop.queryByLabelText('Go to page 7')).not.toBeInTheDocument();
      expect(desktop.queryByLabelText('Go to page 13')).not.toBeInTheDocument();
    });

    it('marks current page with aria-current', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />);
      const currentEl = currentPageIn(screen.getByRole('navigation'));
      expect(currentEl).toHaveAttribute('aria-current', 'page');
      expect(currentEl).toHaveTextContent(/^Page 5$/);
    });
  });

  describe('disabled states', () => {
    it('disables Previous on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
      const prevButton = screen.getAllByLabelText('Go to previous page')[0];
      expect(prevButton).toBeDisabled();
    });

    it('disables Next on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
      const nextButton = screen.getAllByLabelText('Go to next page')[0];
      expect(nextButton).toBeDisabled();
    });

    it('enables both buttons on middle page', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
      const prevButtons = screen.getAllByLabelText('Go to previous page');
      const nextButtons = screen.getAllByLabelText('Go to next page');
      expect(prevButtons[0]).not.toBeDisabled();
      expect(nextButtons[0]).not.toBeDisabled();
    });
  });

  describe('SPA mode (onPageChange)', () => {
    // Regression (keyboard audit): the pressed page button turns into the
    // current marker (unmounts) and Next on the last page becomes disabled —
    // both dropped keyboard focus to <body>. Focus lands on the new current
    // page instead, so Tab continues inside the pagination.
    function Stateful({ start }: { start: number }) {
      const [page, setPage] = useState(start);
      return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />;
    }

    it('keeps focus in the pagination when the pressed page button unmounts', async () => {
      const user = userEvent.setup();
      render(<Stateful start={2} />);
      screen.getByLabelText('Go to page 3').focus();
      await user.keyboard('{Enter}');
      const current = currentPageIn(screen.getByRole('navigation'));
      expect(current).toHaveTextContent(/^Page 3$/);
      expect(current).toHaveFocus();
    });

    it('keeps focus in the pagination when Next becomes disabled on the last page', async () => {
      const user = userEvent.setup();
      render(<Stateful start={4} />);
      screen.getAllByLabelText('Go to next page')[0].focus();
      await user.keyboard('{Enter}');
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toHaveAttribute('data-pagination-current');
    });

    it('calls onPageChange when a page button is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByLabelText('Go to page 4'));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('calls onPageChange with previous page when Previous is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      const prevButtons = screen.getAllByLabelText('Go to previous page');
      await user.click(prevButtons[0]);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with next page when Next is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      const nextButtons = screen.getAllByLabelText('Go to next page');
      await user.click(nextButtons[0]);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('does not call onPageChange when Previous is disabled', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

      const prevButton = screen.getAllByLabelText('Go to previous page')[0];
      await user.click(prevButton);
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('renders buttons, not links', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      expect(nav.querySelector('a')).toBeNull();
    });
  });

  describe('SSR mode (baseUrl)', () => {
    it('renders anchor tags', () => {
      render(<Pagination currentPage={3} totalPages={5} baseUrl="/products" />);
      const nav = screen.getByRole('navigation');
      const links = nav.querySelectorAll('a[href]');
      expect(links.length).toBeGreaterThan(0);
    });

    it('generates correct URLs', () => {
      render(<Pagination currentPage={3} totalPages={5} baseUrl="/products" />);
      const link = screen.getByLabelText('Go to page 4');
      expect(link.closest('a')?.getAttribute('href') ?? link.getAttribute('href')).toContain('page=4');
    });

    it('page 1 URL is the baseUrl without query param', () => {
      render(<Pagination currentPage={3} totalPages={5} baseUrl="/products" />);
      const link = screen.getByLabelText('Go to page 1');
      const href = link.closest('a')?.getAttribute('href') ?? link.getAttribute('href');
      expect(href).toBe('/products');
    });

    it('appends to existing query params with &', () => {
      render(
        <Pagination currentPage={1} totalPages={5} baseUrl="/products?sort=price" />,
      );
      const link = screen.getByLabelText('Go to page 2');
      const href = link.closest('a')?.getAttribute('href') ?? link.getAttribute('href');
      expect(href).toBe('/products?sort=price&page=2');
    });
  });

  describe('truncation edge cases', () => {
    it('shows all pages for 2 pages (no ellipsis)', () => {
      render(<Pagination currentPage={1} totalPages={2} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      expect(nav.textContent).not.toContain('…');
    });

    it('handles 100+ pages without breaking', () => {
      render(<Pagination currentPage={50} totalPages={100} onPageChange={() => {}} />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getByLabelText('Go to page 1')).toBeInTheDocument();
      expect(within(nav).getByLabelText('Go to page 100')).toBeInTheDocument();
      expect(currentPageIn(nav)).toHaveTextContent(/^Page 50$/);
    });

    it('shows correct pattern at beginning: 1 [2] 3 … 20', () => {
      render(<Pagination currentPage={2} totalPages={20} onPageChange={() => {}} />);
      const desktop = screen.getByRole('navigation').querySelector('.ds-pagination__desktop');
      expect(desktop?.textContent).toContain('…');
      expect(currentPageIn(screen.getByRole('navigation'))).toHaveTextContent(/^Page 2$/);
    });

    it('shows correct pattern at end: 1 … 18 [19] 20', () => {
      render(<Pagination currentPage={19} totalPages={20} onPageChange={() => {}} />);
      const desktop = screen.getByRole('navigation').querySelector('.ds-pagination__desktop');
      expect(desktop?.textContent).toContain('…');
      expect(currentPageIn(screen.getByRole('navigation'))).toHaveTextContent(/^Page 19$/);
    });
  });

  describe('mobile layout', () => {
    it('renders page info text', () => {
      render(<Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />);
      const mobile = screen.getByRole('navigation').querySelector('.ds-pagination__mobile');
      expect(mobile?.textContent).toContain('Page 5 of 20');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations in SSR mode', async () => {
      const { container } = render(
        <Pagination currentPage={3} totalPages={10} baseUrl="/products" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('nav has aria-label', () => {
      render(<Pagination currentPage={1} totalPages={5} />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination');
    });

    it('previous and next buttons have aria-labels', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
      expect(screen.getAllByLabelText('Go to previous page').length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText('Go to next page').length).toBeGreaterThan(0);
    });
  });

  // ── Regressions (QA break pass) ─────────────────────────
  describe('regressions', () => {
    const desktopOf = (c: HTMLElement) => c.querySelector('.ds-pagination__desktop')!;

    it('clamps currentPage below 1 — Previous never requests page -1', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { container } = render(
        <Pagination currentPage={0} totalPages={20} onPageChange={onPageChange} />,
      );
      const prev = desktopOf(container).querySelector('[aria-label="Go to previous page"]');
      expect(prev).toBeDisabled();
      await user.click(prev as HTMLElement);
      expect(onPageChange).not.toHaveBeenCalled();
      expect(desktopOf(container).querySelector('[aria-current="page"]')).toHaveTextContent('1');
    });

    it('clamps currentPage beyond totalPages — Next never requests a missing page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { container } = render(
        <Pagination currentPage={25} totalPages={20} onPageChange={onPageChange} />,
      );
      const next = desktopOf(container).querySelector('[aria-label="Go to next page"]');
      expect(next).toBeDisabled();
      await user.click(next as HTMLElement);
      expect(onPageChange).not.toHaveBeenCalled();
      expect(screen.getByText('Page 20 of 20')).toBeInTheDocument();
    });

    it('never uses an ellipsis to stand in for a single page', () => {
      const { container } = render(
        <Pagination currentPage={4} totalPages={10} onPageChange={() => {}} />,
      );
      const labels = [...desktopOf(container).querySelectorAll('.ds-pagination__pages > *')].map(
        (el) => el.textContent,
      );
      // Was 1 … 3 4 5 … 10 — the first ellipsis hid only page 2.
      // (The current page's text includes its hidden "Page " prefix.)
      expect(labels).toEqual(['1', '2', '3', 'Page 4', '5', '…', '10']);
    });
  });
});
