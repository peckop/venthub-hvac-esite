import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ReactElement } from 'react';

/**
 * Saha Denetimi (Dynamic Accessibility Inspector)
 * Mounts a component to JSDOM and runs axe-core to find WCAG violations.
 * 
 * @param ui A React element or an already rendered HTMLElement
 * @returns The axe-core results which can be asserted with `expect(results).toHaveNoViolations()`
 */
export async function testA11y(ui: ReactElement | HTMLElement) {
  const container = ui instanceof HTMLElement ? ui : render(ui).container;
  return await axe(container);
}
