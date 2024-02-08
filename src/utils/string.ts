export function decapitalizeFirstChar(string: string) {
    if (string === null || string.length === 0) {
      return string;
    }
  
    return string[0].toLowerCase() + string.slice(1);
  }
  
  export function capitalizeFirstChar(string: string) {
    if (string === null || string.length === 0) {
      return string;
    }
  
    return string[0].toUpperCase() + string.slice(1);
  }
  
  export function createCleanFile(lines: (string | undefined)[]): string {
    return lines
      .reduce((prev, curr?: string) => {
        if (curr === undefined) {
          return prev;
        }
  
        return prev.concat(curr);
      }, [] as string[])
      .join('\n');
  }
  