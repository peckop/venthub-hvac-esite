declare module 'isomorphic-dompurify' {
  const DOMPurify: {
    sanitize(source: string, config?: Record<string, unknown>): string;
  };
  export default DOMPurify;
}
