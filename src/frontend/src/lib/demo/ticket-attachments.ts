const formats: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};
export const maxAttachments = 5;
export const attachmentAccept = ".png,.jpg,.jpeg,.webp,.pdf";
export function attachmentError(file: Pick<File, "name" | "size" | "type">) {
  const dot = file.name.lastIndexOf(".");
  const ext = file.name.slice(dot + 1).toLowerCase();
  if (
    dot < 1 ||
    !Object.hasOwn(formats, ext) ||
    (file.type && file.type !== formats[ext])
  )
    return "Định dạng không được hỗ trợ.";
  if (file.size > 10_000_000) return "Tệp vượt quá 10.000.000 byte.";
  return null;
}
export function selectAttachments(
  previous: readonly File[],
  incoming: Iterable<File>,
) {
  const files = [...previous];
  const errors: string[] = [];
  for (const file of incoming) {
    const error =
      attachmentError(file) ??
      (files.length >= maxAttachments ? "Chỉ được chọn tối đa 5 tệp." : null);
    if (error) errors.push(file.name + " · " + error);
    else files.push(file);
  }
  return { files, errors };
}
