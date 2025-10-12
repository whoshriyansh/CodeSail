export function getIconForExtension(ext: string): string {
  const iconMap: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    json: "json",
    md: "markdown",
    html: "html",
    css: "css",
    png: "image",
    jpg: "image",
    jpeg: "image",
    svg: "image",
    // add more as needed
  };

  return iconMap[ext] || "file";
}
