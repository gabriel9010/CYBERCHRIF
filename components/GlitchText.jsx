export default function GlitchText({ text, as:Tag="h1", className="" }) {
  return (
    <Tag className={`glitch ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}
