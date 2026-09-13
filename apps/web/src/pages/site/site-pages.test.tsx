import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import { HomeScreen } from './HomeScreen';
import { ServicesScreen } from './ServicesScreen';
import { RemoteSiteScreen } from './RemoteSiteScreen';
import { ContactScreen } from './ContactScreen';
import { NotFoundScreen } from '../NotFoundScreen';

/** Smoke tests: each migrated public page mounts and keeps its original copy. */
describe('public website pages', () => {
  it('HomeScreen renders the hero headline', () => {
    renderWithProviders(<HomeScreen />, { withAuth: false });
    expect(screen.getByRole('heading', { name: /Medical cover, wherever the work is\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request a site assessment/i })).toBeInTheDocument();
  });

  it('HomeScreen lists all six service lines', () => {
    renderWithProviders(<HomeScreen />, { withAuth: false });
    for (const title of [
      'Medical and health consultations',
      'Occupational health',
      'Training and consultancy',
      'Facility equipping and management',
      'Forums and conferences',
      'Medical equipment and supplies',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('ServicesScreen opens on the occupational health tab', () => {
    renderWithProviders(<ServicesScreen />, { withAuth: false });
    expect(screen.getByRole('heading', { name: 'Occupational health' })).toBeInTheDocument();
    expect(screen.getByText(/Pre-placement, periodic, return-to-work and exit examinations/i)).toBeInTheDocument();
  });

  it('RemoteSiteScreen renders the live site register', () => {
    renderWithProviders(<RemoteSiteScreen />, { withAuth: false });
    expect(screen.getByRole('heading', { name: /When the nearest hospital is two hours away/i })).toBeInTheDocument();
    expect(screen.getByText('Jazan Site 4')).toBeInTheDocument();
    expect(screen.getByText('Tabuk Camp 2')).toBeInTheDocument();
  });

  it('ContactScreen renders the enquiry form', () => {
    renderWithProviders(<ContactScreen />, { withAuth: false });
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send request/i })).toBeInTheDocument();
  });

  it('NotFoundScreen offers both entry points', () => {
    renderWithProviders(<NotFoundScreen />, { withAuth: false });
    expect(screen.getByRole('heading', { name: /That page does not exist/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to the website/i })).toBeInTheDocument();
  });
});
