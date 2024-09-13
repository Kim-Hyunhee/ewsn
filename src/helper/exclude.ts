export function exclude<Obj extends object, Key extends keyof Obj>(
  obj: Obj,
  keys: Key[],
): Omit<Obj, Key> {
  if (!!!obj) {
    return obj;
  }

  for (const key of keys) {
    obj.hasOwnProperty(key) && delete obj[key];
  }

  return obj;
}
