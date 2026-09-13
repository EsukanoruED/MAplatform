import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { NotBuiltState } from './ui-states';

/**
 * The portal sections the prototype's index.html rendered through its
 * `Placeholder` component. They are now real routes with the same card, so the
 * sidebar has no dead links.
 */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <>
      <PortalTopBar title={title} />
      <PortalBody>
        <NotBuiltState title={title} />
      </PortalBody>
    </>
  );
}
