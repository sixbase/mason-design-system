import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import type { HTMLAttributes, LiHTMLAttributes, ReactElement } from 'react';
import './Stepper.css';

// ─── Types ────────────────────────────────────────────────

export type StepState = 'completed' | 'active' | 'upcoming';

export interface StepProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'onClick'> {
  /** Visible step label (e.g. "Shipping") */
  label: string;
  /** Visual state — injected by Stepper */
  state?: StepState;
  /** 1-based step number — injected by Stepper */
  stepNumber?: number;
  /** Click handler for completed steps — injected by Stepper */
  onStepClick?: () => void;
}

export interface StepperProps extends HTMLAttributes<HTMLElement> {
  /** Zero-based index of the active step */
  activeStep: number;
  /** Makes COMPLETED steps clickable for backwards navigation.
   *  Upcoming steps are never clickable. */
  onStepClick?: (index: number) => void;
  /** Accessible name for the navigation landmark */
  label?: string;
}

/**
 * Stepper
 *
 * A checkout/progress step indicator with ordered-list semantics.
 * Steps before `activeStep` render as completed (check icon), the
 * active step gets `aria-current="step"`, and later steps render as
 * upcoming. Pass `onStepClick` to let shoppers navigate back to
 * completed steps — upcoming steps are never clickable.
 *
 * Below 640px, labels are hidden except for the active step (a
 * compact ecommerce checkout pattern — dots and connectors remain).
 *
 * @example
 * <Stepper activeStep={1} onStepClick={goToStep}>
 *   <Step label="Cart" />
 *   <Step label="Shipping" />
 *   <Step label="Payment" />
 *   <Step label="Review" />
 * </Stepper>
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    activeStep,
    onStepClick,
    label = 'Progress',
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = ['ds-stepper', className].filter(Boolean).join(' ');

  const steps = Children.toArray(children).filter(isValidElement) as ReactElement<StepProps>[];

  return (
    <nav ref={ref} aria-label={label} className={classes} {...props}>
      <ol className="ds-stepper__list">
        {steps.map((child, index) => {
          const state: StepState =
            index < activeStep ? 'completed' : index === activeStep ? 'active' : 'upcoming';

          return cloneElement(child, {
            key: child.key ?? index,
            state,
            stepNumber: index + 1,
            onStepClick:
              state === 'completed' && onStepClick ? () => onStepClick(index) : undefined,
          });
        })}
      </ol>
    </nav>
  );
});

Stepper.displayName = 'Stepper';

// ─── Step ─────────────────────────────────────────────────

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  {
    label,
    state = 'upcoming',
    stepNumber,
    onStepClick,
    className,
    ...props
  },
  ref,
) {
  const clickable = state === 'completed' && Boolean(onStepClick);

  const classes = [
    'ds-stepper__step',
    `ds-stepper__step--${state}`,
    clickable && 'ds-stepper__step--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="ds-stepper__indicator" aria-hidden="true">
        {state === 'completed' ? <CheckIcon /> : stepNumber}
      </span>
      <span className="ds-stepper__label">{label}</span>
      {state === 'completed' && (
        <span className="ds-stepper__sr-only">(completed)</span>
      )}
    </>
  );

  return (
    <li
      ref={ref}
      className={classes}
      aria-current={state === 'active' ? 'step' : undefined}
      {...props}
    >
      {clickable ? (
        <button type="button" className="ds-stepper__button" onClick={onStepClick}>
          {content}
        </button>
      ) : (
        <span className="ds-stepper__content">{content}</span>
      )}
    </li>
  );
});

Step.displayName = 'Step';

// ─── Icon ─────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1.5 5L4 7.5L8.5 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
