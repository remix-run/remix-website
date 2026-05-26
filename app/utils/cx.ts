// Vendored from clsx by Luke Edwards (MIT): https://github.com/lukeed/clsx

type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];
type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;

export function cx(...inputs: ClassValue[]) {
  let className = "";

  for (let input of inputs) {
    if (!input) continue;

    let value = toClassName(input);
    if (value) className += className ? ` ${value}` : value;
  }

  return className;
}

function toClassName(input: ClassValue): string {
  if (typeof input === "string" || typeof input === "number") {
    return String(input);
  }

  if (typeof input !== "object") return "";

  let className = "";

  if (Array.isArray(input)) {
    for (let item of input) {
      if (!item) continue;

      let value = toClassName(item);
      if (value) className += className ? ` ${value}` : value;
    }
  } else {
    for (let key in input) {
      if (input[key]) className += className ? ` ${key}` : key;
    }
  }

  return className;
}
