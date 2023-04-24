export default async function RSCWebpackPlugin(
  source,
  sourceMap,
) {
  const callback = this.async();
  if (!source.includes('use client')) {
    return callback(null, source, sourceMap);
  }
  const esmSource = `
    export default {
      $$typeof: Symbol.for("react.client.reference"),
      $$id: "file://${this.resourcePath}#default",
    }
  `;
  return callback(null, esmSource, sourceMap);
}
