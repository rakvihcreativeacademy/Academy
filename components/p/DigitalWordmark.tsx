export default function DigitalWordmark({ lazy = false }: { lazy?: boolean }) {
  return (
    <span className="rk-digital-wordmark" aria-hidden="true">
      <img src="/brand/rakvih-digital-original-neon.png" alt="" width={1390} height={450} loading={lazy ? 'lazy' : undefined} />
      <span>DIGITAL</span>
    </span>
  );
}
