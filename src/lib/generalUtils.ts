export function idExtractor<T extends {id: string}>(i: T) {
  return i.id.toString();
}
