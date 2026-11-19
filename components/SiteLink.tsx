import type { ComponentPropsWithoutRef } from 'react';

type SiteLinkProps = ComponentPropsWithoutRef<'a'> & { href: string };

/** Use document navigation to avoid the Next 16.4 streamed-navigation suspension regression. */
export default function SiteLink({ href, children, ...props }: SiteLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
