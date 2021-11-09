function getBranchOrTagFromRef(ref: string): string {
  return ref.replace(/^refs\/(heads|tags)\//, "");
}

function getBranchFromRef(ref: string): string {
  return ref.replace(/^refs\/heads\//, "");
}
function getTagFromRef(ref: string): string {
  return ref.replace(/^refs\/tags\//, "");
}

export { getBranchOrTagFromRef, getBranchFromRef, getTagFromRef };
