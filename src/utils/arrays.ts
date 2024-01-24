export class GroupedArray<T, TKey> extends Array<T> {
  private _key: TKey;

  constructor(key: TKey, ...items: T[]) {
    super(...items);
    this._key = key;
  }

  public get groupKey() {
    return this._key;
  }
}

export function groupBy<T, TKey>(
  arr: T[],
  callback: (item: T) => TKey,
): Array<GroupedArray<T, TKey>> {
  const groups: GroupedArray<T, TKey>[] = [];

  function upsertGroups(key: TKey, item: T) {
    const index = groups.findIndex((x) => x.groupKey === key);

    if (index > -1) {
      groups[index].push(item);
    } else {
      groups.push(new GroupedArray(key, item));
    }
  }

  arr.forEach((item: T) => {
    const key = callback(item);
    upsertGroups(key, item);
  });

  return groups;
}
